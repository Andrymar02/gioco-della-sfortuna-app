import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import * as dao from './dao.js';

// Inizializza l'applicazione Express
const app = express();
const port = 3001;

// --- MIDDLEWARE ---
app.use(morgan('dev')); // Logga le richieste HTTP nel terminale
app.use(express.json()); // Permette di leggere il body delle richieste in formato JSON

// Configurazione CORS (Fondamentale per il pattern dei "due server")
const corsOptions = {
  origin: 'http://localhost:5173', // La porta standard di Vite/React
  credentials: true, // Permette l'invio dei cookie di sessione
};
app.use(cors(corsOptions));

// --- PASSPORT & SESSIONI ---
passport.use(new LocalStrategy(
  async function verify(username, password, cb) {
    try {
      const user = await dao.getUser(username, password);
      if (!user) return cb(null, false, { message: 'Username o password errati.' });
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await dao.getUserById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

// Configurazione della Sessione
app.use(session({
  secret: 'un segreto molto sicuro e lungo per firmare la sessione',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// Middleware custom per verificare se l'utente è loggato
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Non autorizzato. Effettua il login.' });
};

// ==========================================
// API ROUTES
// ==========================================

// --- AUTENTICAZIONE ---

// 1. Login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message });
    
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// 2. Verifica sessione corrente
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Non autenticato' });
  }
});

// 3. Logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

// --- GIOCO ---

// 4. Ottieni 3 carte iniziali (accessibile a tutti: anonimi e loggati)
app.get('/api/cards/initial', async (req, res) => {
  try {
    const cards = await dao.getRandomInitialCards();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle carte iniziali' });
  }
});

// 5. Ottieni la prossima carta da indovinare (nasconde il misery_index)
app.get('/api/cards/next', async (req, res) => {
  try {
    // Legge gli ID da escludere passati come query param (es. ?exclude=1,5,12)
    const excludeIds = req.query.exclude ? req.query.exclude.split(',').map(Number) : [];
    
    const card = await dao.getNextCard(excludeIds);
    if (!card) {
      return res.status(404).json({ error: 'Nessuna carta disponibile' });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della prossima carta' });
  }
});

// 6. Ottieni i dettagli completi di una carta (usato dopo che il giocatore ha fatto la sua scelta)
app.get('/api/cards/:id', async (req, res) => {
  try {
    const card = await dao.getCardById(req.params.id);
    if (card.error) {
      return res.status(404).json(card);
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della carta' });
  }
});

// --- CRONOLOGIA (Solo utenti registrati) ---

// 7. Salva i risultati di una partita
app.post('/api/matches', isLoggedIn, async (req, res) => {
  try {
    const match = req.body;
    // Validazione essenziale dei dati in ingresso
    if (!match || !match.date || !match.status || match.score === undefined || !match.rounds) {
      return res.status(400).json({ error: 'Dati della partita incompleti o non validi' });
    }
    
    const matchId = await dao.saveMatch(req.user.id, match);
    res.status(201).json({ id: matchId });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel salvataggio della partita' });
  }
});

// 8. Ottieni la cronologia dell'utente loggato
app.get('/api/matches', isLoggedIn, async (req, res) => {
  try {
    const matches = await dao.getMatchHistory(req.user.id);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della cronologia' });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`API Server in esecuzione su http://localhost:${port}`);
});