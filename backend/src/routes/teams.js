import express from 'express';
import {
  getAllTeams,
  createTeam,
  deleteTeam,
  addPlayer,
  deletePlayer
} from '../controllers/teamsController.js';

const router = express.Router();

router.get('/', getAllTeams);
router.post('/', createTeam);
router.delete('/:id', deleteTeam);
router.post('/:teamId/players', addPlayer);
router.delete('/players/:playerId', deletePlayer);

export default router;
