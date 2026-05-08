import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Spinner } from 'react-bootstrap';
import * as API from './API';

// Importiamo i nuovi componenti!
import LoginForm from './components/LoginForm';
import Profile from './components/Profile';
import Game from './components/Game';
import Instructions from './components/Instructions';
import RegisterForm from './components/RegisterForm';

// Sotto-componente per la barra di navigazione
function AppNavbar({ user, handleLogout }) {
  const navigate = useNavigate();
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand role="button" onClick={() => navigate('/')}>
          Gioco della Sfortuna 🤦‍♂️
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link onClick={() => navigate('/')}>Gioca</Nav.Link>
          <Nav.Link onClick={() => navigate('/instructions')}>Istruzioni</Nav.Link>
          {user && <Nav.Link onClick={() => navigate('/profile')}>Profilo</Nav.Link>}
        </Nav>
        <Nav>
          {user ? (
            <>
              <Navbar.Text className="me-3">Ciao, {user.username}!</Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="light" className="me-2" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="outline-light" onClick={() => navigate('/register')}>Registrati</Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await API.getUserInfo();
        setUser(currentUser);
      } catch (err) {
        // Nessun utente loggato
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setUser(user);
  };

  const handleLogout = async () => {
    await API.logOut();
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <AppNavbar user={user} handleLogout={handleLogout} />
      <Container>
        <Routes>
          {/* Rotta principale con il Gioco vero e proprio */}
          <Route path="/" element={
             <Game user={user} />
          } />

          {/* Rotta di Login */}
          <Route path="/login" element={
            user ? <Navigate to="/" /> : <LoginForm login={handleLogin} />
          } />

          {/* Rotta Profilo */}
          <Route path="/profile" element={
            user ? <Profile user={user} /> : <Navigate to="/login" />
          } />

          {/* Rotta di Registrazione */}
          <Route path="/register" element={
            user ? <Navigate to="/" /> : <RegisterForm />
          } />

          {/* Fallback per URL inesistenti */}
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/instructions" element={<Instructions />} />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;