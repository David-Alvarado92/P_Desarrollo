import express from 'express';
import {
  saveGame,
  getAllGames,
  getGameById
} from '../controllers/gamesController.js';

const router = express.Router();

router.post('/', saveGame);
router.get('/', getAllGames);
router.get('/:id', getGameById);

export default router;
