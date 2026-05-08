// client/src/components/RegisterForm.jsx
import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import * as API from '../API';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await API.registerUser({ username, password });
      setSuccessMessage('Registrazione completata con successo! Ora puoi fare il login.');
      setUsername('');
      setPassword('');
      // Opzionale: reindirizza automaticamente al login dopo 2 secondi
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMessage(err);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Crea un Account</h2>
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Scegli uno Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Inserisci username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Scegli una Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Inserisci password (min 4 caratteri)" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={4}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Registrati
                </Button>
              </Form>
              
              <div className="mt-3 text-center">
                <small>Hai già un account? <Link to="/login">Fai il login qui</Link></small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterForm;