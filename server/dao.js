import db from './database.js';
import crypto from 'crypto';

// --- GESTIONE UTENTI (Passport) ---

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve({ error: 'User not found.' });
      else {
        const user = { id: row.id, username: row.username };
        resolve(user);
      }
    });
  });
};

export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { id: row.id, username: row.username };
        const salt = row.salt;
        // Verifica la password (come insegnato nel corso)
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);
          const passwordHex = Buffer.from(row.hash, 'hex');
          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

// --- GESTIONE CARTE E GIOCO ---

// Prende 3 carte casuali per iniziare la partita
export const getRandomInitialCards = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards ORDER BY RANDOM() LIMIT 3';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Prende la prossima carta casuale ESCLUDENDO quelle già in gioco
export const getNextCard = (excludedIds) => {
  return new Promise((resolve, reject) => {
    // Creiamo una stringa di ?, ?, ? in base a quanti ID dobbiamo escludere
    const placeholders = excludedIds.map(() => '?').join(',');
    const sql = `SELECT id, name, image_url FROM cards WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`;
    
    db.get(sql, excludedIds, (err, row) => {
      if (err) reject(err);
      else resolve(row); // Ritorna la carta SENZA il misery_index!
    });
  });
};

// Ritorna le info complete di una carta dato l'ID (usato per verificare l'indice)
export const getCardById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM cards WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve({ error: 'Card not found.' });
      else resolve(row);
    });
  });
};

// --- GESTIONE CRONOLOGIA (Utenti Registrati) ---

// Salva una partita e i suoi round
export const saveMatch = (userId, match) => {
  return new Promise((resolve, reject) => {
    // Inseriamo prima il record della partita
    const sqlMatch = 'INSERT INTO matches (user_id, date, status, score) VALUES (?, ?, ?, ?)';
    db.run(sqlMatch, [userId, match.date, match.status, match.score], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      const matchId = this.lastID;
      
      // Prepariamo l'inserimento dei round
      const sqlRound = 'INSERT INTO match_rounds (match_id, card_id, round_number, guessed) VALUES (?, ?, ?, ?)';
      const stmt = db.prepare(sqlRound);
      
      // Inseriamo i dati dei round associati a questa partita
      for (let round of match.rounds) {
        // round_number è null/0 per le 3 carte iniziali, altrimenti è il numero del round
        stmt.run([matchId, round.cardId, round.roundNumber, round.guessed]);
      }
      
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve(matchId);
      });
    });
  });
};

// Recupera la cronologia dell'utente (ordinata per data)
export const getMatchHistory = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT m.id as match_id, m.date, m.status, m.score, 
             r.round_number, r.guessed, c.name, c.misery_index
      FROM matches m
      JOIN match_rounds r ON m.id = r.match_id
      JOIN cards c ON r.card_id = c.id
      WHERE m.user_id = ?
      ORDER BY m.date DESC, r.round_number ASC
    `;
    db.all(sql, [userId], (err, rows) => {
      if (err) reject(err);
      else {
        // Raggruppiamo i risultati per partita
        const matches = [];
        let currentMatchId = null;
        let matchObj = null;

        rows.forEach(row => {
          if (row.match_id !== currentMatchId) {
            if (matchObj) matches.push(matchObj);
            currentMatchId = row.match_id;
            matchObj = {
              id: row.match_id,
              date: row.date,
              status: row.status,
              score: row.score,
              rounds: []
            };
          }
          matchObj.rounds.push({
            roundNumber: row.round_number,
            guessed: row.guessed,
            cardName: row.name,
            miseryIndex: row.misery_index
          });
        });
        if (matchObj) matches.push(matchObj);
        
        resolve(matches);
      }
    });
  });
};