// client/src/components/Profile.jsx
import { useEffect, useState } from 'react';
import { Container, Table, Accordion, Badge, Alert, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';
import * as API from '../API';

function Profile({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await API.getMatchHistory();
        setHistory(data);
      } catch (err) {
        setError('Impossibile caricare la cronologia.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Profilo di {user.username}</h2>
      
      <h4>Cronologia Partite</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {history.length === 0 && !error ? (
        <Alert variant="info">Non hai ancora giocato nessuna partita. Buttati nella sfortuna!</Alert>
      ) : (
        <Accordion>
          {history.map((match, index) => (
            <Accordion.Item eventKey={index.toString()} key={match.id}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100 pe-3">
                  <span>
                    <strong>Partita del:</strong> {dayjs(match.date).format('DD/MM/YYYY HH:mm')}
                  </span>
                  <span>
                    <strong>Esito:</strong> {' '}
                    <Badge bg={match.status === 'won' ? 'success' : 'danger'}>
                      {match.status === 'won' ? 'Vinta' : 'Persa'}
                    </Badge>
                  </span>
                  <span><strong>Carte raccolte:</strong> {match.score} / 6</span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Table size="sm" striped bordered hover>
                  <thead>
                    <tr>
                      <th>Round</th>
                      <th>Evento Imbarazzante</th>
                      <th>Indice di Sfortuna</th>
                      <th>Esito Round</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.rounds.map((round, rIndex) => (
                      <tr key={rIndex}>
                        <td>{round.roundNumber ? round.roundNumber : 'Iniziale'}</td>
                        <td>{round.cardName}</td>
                        <td>{round.miseryIndex}</td>
                        <td>
                          {round.roundNumber ? (
                            round.guessed ? 
                              <Badge bg="success">Indovinato</Badge> : 
                              <Badge bg="danger">Sbagliato/Scaduto</Badge>
                          ) : (
                            <Badge bg="secondary">Assegnata</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
}

export default Profile;