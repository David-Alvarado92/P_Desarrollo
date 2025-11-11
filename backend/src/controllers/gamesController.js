import { getPool, sql } from '../config/database.js';

// Guardar un partido
export async function saveGame(req, res) {
  try {
    const {
      teamA,
      teamB,
      finalScoreA,
      finalScoreB,
      period,
      status, // 'completed', 'cancelled', 'suspended'
      stats,
      history,
      sanctions,
      settings
    } = req.body;

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Insertar el partido
      const gameResult = await transaction.request()
        .input('teamA_id', sql.VarChar, teamA.id)
        .input('teamA_name', sql.NVarChar, teamA.name)
        .input('teamB_id', sql.VarChar, teamB.id)
        .input('teamB_name', sql.NVarChar, teamB.name)
        .input('finalScoreA', sql.Int, finalScoreA)
        .input('finalScoreB', sql.Int, finalScoreB)
        .input('period', sql.Int, period)
        .input('status', sql.VarChar, status)
        .input('stats', sql.NVarChar(sql.MAX), JSON.stringify(stats))
        .input('settings', sql.NVarChar(sql.MAX), JSON.stringify(settings))
        .query(`
          INSERT INTO Games (teamA_id, teamA_name, teamB_id, teamB_name,
                            finalScoreA, finalScoreB, period, status, stats, settings)
          OUTPUT INSERTED.id
          VALUES (@teamA_id, @teamA_name, @teamB_id, @teamB_name,
                  @finalScoreA, @finalScoreB, @period, @status, @stats, @settings)
        `);

      const gameId = gameResult.recordset[0].id;

      // Insertar historial de jugadas
      if (history && history.length > 0) {
        for (const play of history) {
          await transaction.request()
            .input('game_id', sql.Int, gameId)
            .input('team', sql.VarChar, play.team)
            .input('player_name', sql.NVarChar, play.playerName)
            .input('player_number', sql.VarChar, play.playerNumber)
            .input('delta', sql.Int, play.delta)
            .input('scoreA', sql.Int, play.scoreA)
            .input('scoreB', sql.Int, play.scoreB)
            .input('period', sql.Int, play.period)
            .input('timestamp', sql.BigInt, play.t)
            .query(`
              INSERT INTO GameHistory (game_id, team, player_name, player_number,
                                      delta, scoreA, scoreB, period, timestamp)
              VALUES (@game_id, @team, @player_name, @player_number,
                      @delta, @scoreA, @scoreB, @period, @timestamp)
            `);
        }
      }

      // Insertar sanciones
      if (sanctions && sanctions.length > 0) {
        for (const sanction of sanctions) {
          await transaction.request()
            .input('game_id', sql.Int, gameId)
            .input('team', sql.VarChar, sanction.team)
            .input('player_name', sql.NVarChar, sanction.playerName)
            .input('player_number', sql.VarChar, sanction.playerNumber)
            .input('type', sql.VarChar, sanction.type)
            .input('period', sql.Int, sanction.period)
            .input('timestamp', sql.BigInt, sanction.t)
            .query(`
              INSERT INTO Sanctions (game_id, team, player_name, player_number,
                                    type, period, timestamp)
              VALUES (@game_id, @team, @player_name, @player_number,
                      @type, @period, @timestamp)
            `);
        }
      }

      await transaction.commit();

      res.status(201).json({
        message: 'Partido guardado exitosamente',
        gameId
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al guardar partido:', error);
    res.status(500).json({ error: 'Error al guardar partido' });
  }
}

// Obtener todos los partidos
export async function getAllGames(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM Games
      ORDER BY created_at DESC
    `);

    const games = result.recordset.map(game => ({
      ...game,
      stats: game.stats ? JSON.parse(game.stats) : {},
      settings: game.settings ? JSON.parse(game.settings) : {}
    }));

    res.json(games);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
}

// Obtener un partido específico con todo su detalle
export async function getGameById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Obtener información del partido
    const gameResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Games WHERE id = @id');

    if (gameResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const game = gameResult.recordset[0];

    // Obtener historial
    const historyResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM GameHistory WHERE game_id = @id ORDER BY timestamp DESC');

    // Obtener sanciones
    const sanctionsResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Sanctions WHERE game_id = @id ORDER BY timestamp DESC');

    res.json({
      ...game,
      stats: game.stats ? JSON.parse(game.stats) : {},
      settings: game.settings ? JSON.parse(game.settings) : {},
      history: historyResult.recordset,
      sanctions: sanctionsResult.recordset
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({ error: 'Error al obtener partido' });
  }
}
