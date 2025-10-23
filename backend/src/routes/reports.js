import { Router } from 'express';
import {
  generateTeamsReport,
  generatePlayersByTeamReport,
  generateMatchesHistoryReport,
  generateRosterByMatchReport,
  generatePlayerStatsReport,
} from '../controllers/reportsController.js';

const router = Router();

// REPORTE 1: Lista de equipos registrados
router.get('/reports/teams', generateTeamsReport);

// REPORTE 2: Jugadores por equipo específico
router.get('/reports/teams/:teamId/players', generatePlayersByTeamReport);

// REPORTE 3: Historial de partidos
router.get('/reports/matches/history', generateMatchesHistoryReport);

// REPORTE 4: Roster por partido específico
router.get('/reports/matches/:matchId/roster', generateRosterByMatchReport);

// REPORTE 5: Estadísticas por jugador
router.get('/reports/players/:playerId/stats', generatePlayerStatsReport);

export default router;