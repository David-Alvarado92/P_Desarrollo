import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';

const API_URL = 'http://localhost:3010/api';

export default function ReportsPanel() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');

  // Selecciones
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState('');

  // Token comentado temporalmente para pruebas
  // const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Sin headers de autenticación para pruebas
      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/players`),
        fetch(`${API_URL}/matches`),
      ]);

      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (playersRes.ok) setPlayers(await playersRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const downloadPDF = async (endpoint, filename, reportKey) => {
    setLoading((prev) => ({ ...prev, [reportKey]: true }));
    setError('');

    try {
      // Sin headers de autenticación para pruebas
      const res = await fetch(`${API_URL}${endpoint}`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  return (
    <div className="py-4">
      <h2 className="mb-4 fw-bold">📊 Generador de Reportes PDF</h2>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <Row className="g-4">
        {/* REPORTE 1: Equipos */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>🏀 Equipos Registrados</Card.Title>
              <Card.Text className="text-secondary">
                Lista completa de todos los equipos con nombre, ciudad y logo.
              </Card.Text>
              <Button
                variant="primary"
                onClick={() => downloadPDF('/reports/teams', 'reporte_equipos.pdf', 'teams')}
                disabled={loading.teams}
              >
                {loading.teams ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  'Descargar PDF'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* REPORTE 2: Jugadores por equipo */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>👥 Jugadores por Equipo</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary">Selecciona un equipo:</Form.Label>
                <Form.Select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">— Selecciona —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="success"
                disabled={!selectedTeamId || loading.players}
                onClick={() =>
                  downloadPDF(
                    `/reports/teams/${selectedTeamId}/players`,
                    `jugadores_equipo_${selectedTeamId}.pdf`,
                    'players'
                  )
                }
              >
                {loading.players ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  'Descargar PDF'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* REPORTE 3: Historial de partidos */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>📅 Historial de Partidos</Card.Title>
              <Card.Text className="text-secondary">
                Todos los partidos jugados con equipos, fecha/hora y marcador.
              </Card.Text>
              <Button
                variant="info"
                onClick={() =>
                  downloadPDF('/reports/matches/history', 'historial_partidos.pdf', 'matches')
                }
                disabled={loading.matches}
              >
                {loading.matches ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  'Descargar PDF'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* REPORTE 4: Roster por partido */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>📋 Roster por Partido</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary">Selecciona un partido:</Form.Label>
                <Form.Select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                >
                  <option value="">— Selecciona —</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.homeTeam?.name || 'Local'} vs {m.awayTeam?.name || 'Visita'} -{' '}
                      {new Date(m.dateTime).toLocaleDateString()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="warning"
                disabled={!selectedMatchId || loading.roster}
                onClick={() =>
                  downloadPDF(
                    `/reports/matches/${selectedMatchId}/roster`,
                    `roster_partido_${selectedMatchId}.pdf`,
                    'roster'
                  )
                }
              >
                {loading.roster ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  'Descargar PDF'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* REPORTE 5: Estadísticas por jugador */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>📈 Estadísticas por Jugador</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary">Selecciona un jugador:</Form.Label>
                <Form.Select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                >
                  <option value="">— Selecciona —</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} ({p.team?.name || 'Sin equipo'})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="danger"
                disabled={!selectedPlayerId || loading.stats}
                onClick={() =>
                  downloadPDF(
                    `/reports/players/${selectedPlayerId}/stats`,
                    `estadisticas_jugador_${selectedPlayerId}.pdf`,
                    'stats'
                  )
                }
              >
                {loading.stats ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Generando...
                  </>
                ) : (
                  'Descargar PDF'
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}