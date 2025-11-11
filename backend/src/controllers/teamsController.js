import { getPool, sql } from '../config/database.js';

// Obtener todos los equipos
export async function getAllTeams(req, res) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT t.*,
        (SELECT p.id, p.name, p.number
         FROM Players p
         WHERE p.team_id = t.id
         FOR JSON PATH) as players
      FROM Teams t
      ORDER BY t.created_at DESC
    `);

    const teams = result.recordset.map(team => ({
      ...team,
      players: team.players ? JSON.parse(team.players) : []
    }));

    res.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
}

// Crear un nuevo equipo
export async function createTeam(req, res) {
  try {
    const { id, name, logo } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('name', sql.NVarChar, name)
      .input('logo', sql.NVarChar(sql.MAX), logo)
      .query(`
        INSERT INTO Teams (id, name, logo)
        VALUES (@id, @name, @logo)
      `);

    res.status(201).json({ message: 'Equipo creado exitosamente', id });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
}

// Eliminar un equipo
export async function deleteTeam(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Primero eliminar jugadores asociados
    await pool.request()
      .input('teamId', sql.VarChar, id)
      .query('DELETE FROM Players WHERE team_id = @teamId');

    // Luego eliminar el equipo
    await pool.request()
      .input('id', sql.VarChar, id)
      .query('DELETE FROM Teams WHERE id = @id');

    res.json({ message: 'Equipo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
}

// Agregar jugador a un equipo
export async function addPlayer(req, res) {
  try {
    const { teamId } = req.params;
    const { id, name, number } = req.body;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, id)
      .input('teamId', sql.VarChar, teamId)
      .input('name', sql.NVarChar, name)
      .input('number', sql.VarChar, number)
      .query(`
        INSERT INTO Players (id, team_id, name, number)
        VALUES (@id, @teamId, @name, @number)
      `);

    res.status(201).json({ message: 'Jugador agregado exitosamente' });
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    res.status(500).json({ error: 'Error al agregar jugador' });
  }
}

// Eliminar jugador
export async function deletePlayer(req, res) {
  try {
    const { playerId } = req.params;
    const pool = await getPool();

    await pool.request()
      .input('id', sql.VarChar, playerId)
      .query('DELETE FROM Players WHERE id = @id');

    res.json({ message: 'Jugador eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
}
