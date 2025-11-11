// Configuración de la URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error en la petición');
  }
  return response.json();
}

// TEAMS API

export async function getAllTeams() {
  try {
    const response = await fetch(`${API_URL}/teams`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    // Fallback a localStorage si falla la API
    const saved = localStorage.getItem('sb_teams');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function createTeam(team) {
  try {
    const response = await fetch(`${API_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al crear equipo:', error);
    throw error;
  }
}

export async function deleteTeam(teamId) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      method: 'DELETE'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    throw error;
  }
}

export async function addPlayer(teamId, player) {
  try {
    const response = await fetch(`${API_URL}/teams/${teamId}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(player)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al agregar jugador:', error);
    throw error;
  }
}

export async function deletePlayer(playerId) {
  try {
    const response = await fetch(`${API_URL}/teams/players/${playerId}`, {
      method: 'DELETE'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    throw error;
  }
}

// GAMES API

export async function saveGame(gameData) {
  try {
    const response = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al guardar partido:', error);
    throw error;
  }
}

export async function getAllGames() {
  try {
    const response = await fetch(`${API_URL}/games`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    return [];
  }
}

export async function getGameById(gameId) {
  try {
    const response = await fetch(`${API_URL}/games/${gameId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error al obtener partido:', error);
    throw error;
  }
}
