import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';

// ============================================
// REPORTE 1: EQUIPOS REGISTRADOS
// ============================================
export async function generateTeamsReport(req, res) {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_equipos.pdf');
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('REPORTE DE EQUIPOS REGISTRADOS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    // Tabla
    const startY = doc.y;
    const colWidths = { name: 200, city: 150, logo: 150 };
    
    // Headers
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Nombre', 50, startY, { width: colWidths.name, continued: true });
    doc.text('Ciudad', 50 + colWidths.name, startY, { width: colWidths.city, continued: true });
    doc.text('Logo', 50 + colWidths.name + colWidths.city, startY, { width: colWidths.logo });
    doc.moveDown();
    
    // Línea separadora
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Datos
    doc.fontSize(10).font('Helvetica');
    teams.forEach((team, idx) => {
      const y = doc.y;
      doc.text(team.name, 50, y, { width: colWidths.name, continued: true });
      doc.text(team.city || 'N/A', 50 + colWidths.name, y, { width: colWidths.city, continued: true });
      doc.text(team.logoUrl ? '✓ Sí' : '✗ No', 50 + colWidths.name + colWidths.city, y, { width: colWidths.logo });
      doc.moveDown();

      if (idx < teams.length - 1) {
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeOpacity(0.3).stroke().strokeOpacity(1);
        doc.moveDown(0.5);
      }
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Total de equipos: ${teams.length}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error generando reporte de equipos:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}

// ============================================
// REPORTE 2: JUGADORES POR EQUIPO
// ============================================
export async function generatePlayersByTeamReport(req, res) {
  try {
    const teamId = parseInt(req.params.teamId);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: { orderBy: { number: 'asc' } } },
    });

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=jugadores_${team.name}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('REPORTE DE JUGADORES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Equipo: ${team.name}`, { align: 'center' });
    doc.fontSize(12).text(`Ciudad: ${team.city || 'N/A'}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    if (team.players.length === 0) {
      doc.fontSize(12).text('Este equipo no tiene jugadores registrados.', { align: 'center' });
    } else {
      // Tabla
      const startY = doc.y;
      const colWidths = { number: 60, name: 200, position: 100, age: 60, height: 80, nationality: 100 };
      
      // Headers
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('#', 50, startY, { width: colWidths.number, continued: true });
      doc.text('Nombre Completo', 50 + colWidths.number, startY, { width: colWidths.name, continued: true });
      doc.text('Posición', 50 + colWidths.number + colWidths.name, startY, { width: colWidths.position, continued: true });
      doc.text('Edad', 50 + colWidths.number + colWidths.name + colWidths.position, startY, { width: colWidths.age, continued: true });
      doc.text('Estatura', 50 + colWidths.number + colWidths.name + colWidths.position + colWidths.age, startY, { width: colWidths.height, continued: true });
      doc.text('Nacionalidad', 50 + colWidths.number + colWidths.name + colWidths.position + colWidths.age + colWidths.height, startY);
      doc.moveDown();
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Datos (nota: tu schema actual solo tiene name y number, aquí simulo otros campos)
      doc.fontSize(10).font('Helvetica');
      team.players.forEach((player, idx) => {
        const y = doc.y;
        doc.text(player.number, 50, y, { width: colWidths.number, continued: true });
        doc.text(player.name, 50 + colWidths.number, y, { width: colWidths.name, continued: true });
        doc.text('N/A', 50 + colWidths.number + colWidths.name, y, { width: colWidths.position, continued: true });
        doc.text('N/A', 50 + colWidths.number + colWidths.name + colWidths.position, y, { width: colWidths.age, continued: true });
        doc.text('N/A', 50 + colWidths.number + colWidths.name + colWidths.position + colWidths.age, y, { width: colWidths.height, continued: true });
        doc.text('N/A', 50 + colWidths.number + colWidths.name + colWidths.position + colWidths.age + colWidths.height, y);
        doc.moveDown();

        if (idx < team.players.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeOpacity(0.3).stroke().strokeOpacity(1);
          doc.moveDown(0.5);
        }
      });

      doc.moveDown(2);
      doc.fontSize(10).text(`Total de jugadores: ${team.players.length}`, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('Error generando reporte de jugadores:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}

// ============================================
// REPORTE 3: HISTORIAL DE PARTIDOS
// ============================================
export async function generateMatchesHistoryReport(req, res) {
  try {
    const matches = await prisma.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { dateTime: 'desc' },
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=historial_partidos.pdf');
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('HISTORIAL DE PARTIDOS', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    if (matches.length === 0) {
      doc.fontSize(12).text('No hay partidos registrados.', { align: 'center' });
    } else {
      // Tabla
      const startY = doc.y;
      const colWidths = { date: 120, home: 140, away: 140, score: 100 };
      
      // Headers
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Fecha/Hora', 50, startY, { width: colWidths.date, continued: true });
      doc.text('Equipo Local', 50 + colWidths.date, startY, { width: colWidths.home, continued: true });
      doc.text('Equipo Visitante', 50 + colWidths.date + colWidths.home, startY, { width: colWidths.away, continued: true });
      doc.text('Marcador', 50 + colWidths.date + colWidths.home + colWidths.away, startY);
      doc.moveDown();
      
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Datos
      doc.fontSize(10).font('Helvetica');
      matches.forEach((match, idx) => {
        const y = doc.y;
        const dateStr = new Date(match.dateTime).toLocaleString('es-GT');
        doc.text(dateStr, 50, y, { width: colWidths.date, continued: true });
        doc.text(match.homeTeam.name, 50 + colWidths.date, y, { width: colWidths.home, continued: true });
        doc.text(match.awayTeam.name, 50 + colWidths.date + colWidths.home, y, { width: colWidths.away, continued: true });
        doc.text('N/A - N/A', 50 + colWidths.date + colWidths.home + colWidths.away, y); // No tienes scoreHome/scoreAway en schema
        doc.moveDown();

        if (idx < matches.length - 1) {
          doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeOpacity(0.3).stroke().strokeOpacity(1);
          doc.moveDown(0.5);
        }
      });

      doc.moveDown(2);
      doc.fontSize(10).text(`Total de partidos: ${matches.length}`, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    console.error('Error generando historial de partidos:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}

// ============================================
// REPORTE 4: ROSTER POR PARTIDO
// ============================================
export async function generateRosterByMatchReport(req, res) {
  try {
    const matchId = parseInt(req.params.matchId);
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { include: { players: { orderBy: { number: 'asc' } } } },
        awayTeam: { include: { players: { orderBy: { number: 'asc' } } } },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Partido no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=roster_partido_${matchId}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('ROSTER POR PARTIDO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`${match.homeTeam.name} vs ${match.awayTeam.name}`, { align: 'center' });
    doc.fontSize(12).text(`Fecha: ${new Date(match.dateTime).toLocaleString('es-GT')}`, { align: 'center' });
    doc.moveDown(2);

    // Roster Local
    doc.fontSize(14).font('Helvetica-Bold').text(`Equipo Local: ${match.homeTeam.name}`);
    doc.moveDown(0.5);
    
    if (match.homeTeam.players.length === 0) {
      doc.fontSize(10).font('Helvetica').text('Sin jugadores registrados');
    } else {
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('#', 50, doc.y, { width: 40, continued: true });
      doc.text('Nombre', 90, doc.y);
      doc.moveDown(0.5);
      doc.font('Helvetica');
      match.homeTeam.players.forEach((p) => {
        doc.text(p.number, 50, doc.y, { width: 40, continued: true });
        doc.text(p.name, 90, doc.y);
        doc.moveDown(0.5);
      });
    }

    doc.moveDown(2);

    // Roster Visitante
    doc.fontSize(14).font('Helvetica-Bold').text(`Equipo Visitante: ${match.awayTeam.name}`);
    doc.moveDown(0.5);
    
    if (match.awayTeam.players.length === 0) {
      doc.fontSize(10).font('Helvetica').text('Sin jugadores registrados');
    } else {
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('#', 50, doc.y, { width: 40, continued: true });
      doc.text('Nombre', 90, doc.y);
      doc.moveDown(0.5);
      doc.font('Helvetica');
      match.awayTeam.players.forEach((p) => {
        doc.text(p.number, 50, doc.y, { width: 40, continued: true });
        doc.text(p.name, 90, doc.y);
        doc.moveDown(0.5);
      });
    }

    doc.end();
  } catch (error) {
    console.error('Error generando roster por partido:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}

// ============================================
// REPORTE 5: ESTADÍSTICAS POR JUGADOR
// ============================================
export async function generatePlayerStatsReport(req, res) {
  try {
    const playerId = parseInt(req.params.playerId);
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { team: true },
    });

    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=estadisticas_${player.name}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('ESTADÍSTICAS DEL JUGADOR', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`${player.name} (#${player.number})`, { align: 'center' });
    doc.fontSize(12).text(`Equipo: ${player.team.name}`, { align: 'center' });
    doc.moveDown(2);

    // Nota: Tu schema actual NO tiene estadísticas, aquí simulo datos
    doc.fontSize(12).font('Helvetica');
    doc.text('Resumen de estadísticas:', 50);
    doc.moveDown();
    
    const stats = [
      { label: 'Puntos totales', value: 'N/A' },
      { label: 'Asistencias', value: 'N/A' },
      { label: 'Rebotes', value: 'N/A' },
      { label: 'Faltas cometidas', value: 'N/A' },
      { label: 'Partidos jugados', value: 'N/A' },
    ];

    stats.forEach((stat) => {
      doc.fontSize(11).font('Helvetica-Bold').text(stat.label, 80, doc.y, { continued: true });
      doc.font('Helvetica').text(`: ${stat.value}`, { align: 'left' });
      doc.moveDown(0.8);
    });

    doc.moveDown(2);
    doc.fontSize(10).fillColor('red').text(
      '⚠ Nota: Tu base de datos actual no incluye estadísticas. Necesitarías agregar un modelo "PlayerStats" para registrar estos datos.',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error generando estadísticas del jugador:', error);
    res.status(500).json({ error: 'Error generando PDF' });
  }
}