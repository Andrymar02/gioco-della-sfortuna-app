# Gioco della Sfortuna - Esame Applicazioni Web I

## Server-side

### API HTTP
* **POST `/api/sessions`**: Effettua il login dell'utente. *Request body*: `{ username, password }`. *Response*: oggetto utente o errore 401.
* **GET `/api/sessions/current`**: Verifica se esiste una sessione valida. *Response*: oggetto utente o errore 401.
* **DELETE `/api/sessions/current`**: Effettua il logout eliminando la sessione corrente.
* **GET `/api/cards/initial`**: Restituisce 3 carte casuali complete di `misery_index` per iniziare la partita.
* **GET `/api/cards/next?exclude=id1,id2`**: Restituisce una carta casuale escludendo quelle già in gioco. Il `misery_index` **non** è incluso nella risposta per evitare cheat.
* **GET `/api/cards/:id`**: Restituisce i dettagli completi (incluso `misery_index`) di una singola carta. Usato per la verifica dopo la scelta del giocatore.
* **POST `/api/matches`**: Salva una partita terminata e i relativi round. *Richiede autenticazione*. *Request body*: oggetto match con array di rounds.
* **GET `/api/matches`**: Recupera la cronologia delle partite dell'utente loggato. *Richiede autenticazione*.

### Database Tables
* **`users`**: Memorizza le credenziali degli utenti registrati (id, username, hash della password, salt).
* **`cards`**: Contiene il mazzo di 100 situazioni imbarazzanti (id, nome, immagine, misery_index).
* **`matches`**: Memorizza l'esito globale delle partite giocate dagli utenti (id, user_id, date, status, score).
* **`match_rounds`**: Associa ad ogni partita i dettagli dei singoli round giocati e delle carte iniziali (id, match_id, card_id, round_number, guessed).

## Client-side

### Routes
* **`/` (Home)**: Contiene la plancia di gioco (`Game.jsx`). Se l'utente non è loggato, permette di giocare solo un round (Demo), altrimenti permette partite complete.
* **`/login`**: Mostra il form per l'autenticazione. Se l'utente è già loggato, reindirizza alla Home.
* **`/profile`**: Mostra la cronologia delle partite dell'utente sotto forma di Accordion. Accessibile solo agli utenti loggati.
* **`/instructions`**: Pagina statica che spiega le regole del gioco, accessibile a tutti.

### Main React Components
* **`App`** (`App.jsx`): Gestisce il Router, lo stato globale dell'utente (sessione) e la Navbar principale.
* **`Game`** (`Game.jsx`): Il componente più complesso. Gestisce la logica di gioco, i timer, il calcolo dei punteggi, la validazione degli indici e la renderizzazione dinamica degli slot e delle carte.
* **`Profile`** (`Profile.jsx`): Recupera e mostra la history dal database formattando le date e creando tabelle per i dettagli dei round.
* **`LoginForm`** (`LoginForm.jsx`): Gestisce l'input delle credenziali e mostra gli alert in caso di errore.

## Screenshots

![Screenshot Gioco](./game-screenshot.png)
![Screenshot Cronologia](./history-screenshot.png)

## Users Credentials

* **Username:** `giocatore1` | **Password:** `password`
* **Username:** `giocatore2` | **Password:** `password`