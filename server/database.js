import sqlite3 from 'sqlite3';

// Inizializza il database SQLite
const db = new sqlite3.Database('game.sqlite', (err) => {
  if (err) throw err;
});

// Abilita le foreign key
db.run("PRAGMA foreign_keys = ON");

// Creazione Tabelle
db.serialize(() => {
  // Tabella Utenti
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hash TEXT NOT NULL,
    salt TEXT NOT NULL
  )`);

  // Tabella Carte (Eventi Imbarazzanti nella vita quotidiana)
  db.run(`CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    misery_index REAL UNIQUE NOT NULL
  )`, () => {
    
    // Popolamento del db con le 100 carte
    db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
      if (row.count === 0) {
        const initialCards = [
          ['Aprire la fotocamera frontale per sbaglio e vedere il proprio doppio mento', 'cam.jpg', 1],
          ['Dimenticare dove hai parcheggiato l\'auto al centro commerciale', 'parking.jpg', 2],
          ['Spingere una porta su cui c\'è scritto a caratteri cubitali "TIRARE"', 'door.jpg', 3],
          ['Inciampare su un gradino invisibile mentre cammini per strada', 'trip.jpg', 4],
          ['Perdere il filo del discorso a metà di una frase', 'speech.jpg', 5],
          ['Salutare qualcuno che in realtà stava salutando la persona dietro di te', 'wave.jpg', 6],
          ['Dimenticare il nome di una persona un secondo dopo che si è presentata', 'name.jpg', 7],
          ['Rispondere "Anche a te" al cameriere che ti dice "Buon appetito"', 'waiter.jpg', 8],
          ['Avere un pezzo di insalata tra i denti per tutto il pranzo', 'teeth.jpg', 9],
          ['Mandare un vocale lunghissimo e accorgersi di aver parlato a vuoto', 'voice.jpg', 10],
          ['Fare una battuta in gruppo e nessuno ride', 'joke.jpg', 11],
          ['Sbadigliare rumorosamente in un momento di silenzio totale', 'yawn.jpg', 12],
          ['La tua pancia brontola fortissimo in sala d\'attesa', 'stomach.jpg', 13],
          ['Cercare gli occhiali che hai già in testa', 'glasses.jpg', 14],
          ['Rispondere al telefono dicendo "Pronto" con una voce stridula', 'phone.jpg', 15],
          ['Caderti una moneta e rincorrerla mentre rotola via', 'coin.jpg', 16],
          ['Premere il pulsante per scendere dall\'autobus troppo presto', 'bus.jpg', 17],
          ['Sbagliare l\'uscita della rotonda per tre volte di fila', 'roundabout.jpg', 18],
          ['Bagnarsi i pantaloni lavandosi le mani nel lavandino', 'sink.jpg', 19],
          ['Accorgerti di avere la maglietta al contrario a metà giornata', 'shirt.jpg', 20],
          ['Entrare in un negozio, non comprare nulla e uscire sentendosi un ladro', 'store.jpg', 21],
          ['Fingere di mandare un messaggio perché sei in imbarazzo da solo', 'fake-text.jpg', 22],
          ['Dover chiedere di ripetere una cosa per la terza volta', 'repeat.jpg', 23],
          ['Soffiare sul gelato perché sei abituato a farlo con la minestra', 'icecream.jpg', 24],
          ['Chiamare "Mamma" la maestra o la professoressa', 'teacher.jpg', 25],
          ['Inviare un\'email senza l\'allegato promesso', 'attachment.jpg', 26],
          ['Incontrare lo sguardo di uno sconosciuto e distogliere subito gli occhi', 'stare.jpg', 27],
          ['Starnutire e far volare via i fogli sulla scrivania', 'sneeze.jpg', 28],
          ['Salire su un ascensore vuoto e dimenticarsi di premere il piano', 'elevator.jpg', 29],
          ['La carta di credito non viene letta al primo colpo', 'card1.jpg', 30],
          ['Accorgerti che stai camminando nella direzione sbagliata e fare un finto testacoda', 'turn.jpg', 31],
          ['Dire "Piacere" a qualcuno che conosci già da anni', 'nice-to-meet.jpg', 32],
          ['Fissare il vuoto e accorgerti che stavi fissando una persona', 'staring.jpg', 33],
          ['Scrivere un messaggio lungo e la persona risponde solo "ok"', 'ok.jpg', 34],
          ['Dare il cinque a qualcuno che voleva solo battere il pugno', 'high-five.jpg', 35],
          ['Iniziare a parlare contemporaneamente a un\'altra persona e fermarsi entrambi', 'talk.jpg', 36],
          ['Tossire senza s sosta in un luogo silenzioso (es. cinema o teatro)', 'cough.jpg', 37],
          ['Caderti il telefono in faccia mentre sei a letto', 'phone-face.jpg', 38],
          ['Cantare una canzone ad alta voce sbagliando completamente le parole', 'sing.jpg', 39],
          ['Accorgersi di avere la cerniera dei pantaloni abbassata in pubblico', 'zipper.jpg', 40],
          ['Entrare in una stanza e dimenticare perché ci sei entrato', 'room.jpg', 41],
          ['Fare un sorriso tirato a qualcuno che ti ha fatto un complimento imbarazzante', 'smile.jpg', 42],
          ['Sbagliare a pronunciare una parola straniera davanti a tutti', 'pronunciation.jpg', 43],
          ['Addormentarsi sul treno e sbavare sul finestrino', 'drool.jpg', 44],
          ['Ridere a una battuta che non hai capito, poi ti chiedono di spiegarla', 'laugh.jpg', 45],
          ['Sbagliare classe/aula all\'università e accorgersene a lezione iniziata', 'class.jpg', 46],
          ['Trovarsi senza carta igienica nel bagno di un ospite', 'tp.jpg', 47],
          ['Tentare di fare una foto di nascosto e ti parte il flash', 'flash.jpg', 48],
          ['La sedia fa un rumore strano che sembra una flatulenza in ufficio', 'chair.jpg', 49],
          ['Mettere mi piace per sbaglio a una foto di 3 anni fa della tua ex', 'like.jpg', 50],
          ['Rispondere al citofono in pigiama e capelli spettinati', 'intercom.jpg', 51],
          ['Camminare con un pezzo di carta igienica attaccato alla scarpa', 'shoe.jpg', 52],
          ['Essere sorpresi a parlare da soli ad alta voce', 'talk-self.jpg', 53],
          ['Dimenticare il pin del bancomat con una lunga fila dietro di te', 'pin.jpg', 54],
          ['Versarsi il caffè sui pantaloni chiari prima di un colloquio', 'coffee.jpg', 55],
          ['Scivolare sul bagnato in mezzo a una piazza affollata', 'slip.jpg', 56],
          ['Inviare un cuore alla chat del gruppo di lavoro', 'heart.jpg', 57],
          ['Aprire la portiera dell\'auto sbagliata pensando sia la tua', 'wrong-car.jpg', 58],
          ['Rimanere bloccati nelle porte automatiche della metro', 'doors.jpg', 59],
          ['Dimenticarsi il portafoglio alla cassa del supermercato', 'wallet.jpg', 60],
          ['Condividere lo schermo e avere una scheda di ricerca imbarazzante aperta', 'screen.jpg', 61],
          ['Cadere dalla sedia mentre stai cercando di dondolarti', 'fall.jpg', 62],
          ['Essere sgridato da un vigile urbano con tante persone che guardano', 'cop.jpg', 63],
          ['Lasciarsi scappare una risatina acuta durante una sfuriata del capo', 'boss.jpg', 64],
          ['Andare a dare un bacio sulla guancia e l\'altra persona ti dà la mano', 'kiss.jpg', 65],
          ['Trovare la tua macchina rimossa dal carro attrezzi', 'tow.jpg', 66],
          ['Inviare un messaggio privato nel gruppo della famiglia numerosa', 'family.jpg', 67],
          ['Strapparsi i pantaloni chinandosi per raccogliere qualcosa', 'pants.jpg', 68],
          ['Attivare accidentalmente un video a volume massimo in biblioteca', 'loud.jpg', 69],
          ['Essere chiamati alla lavagna/riunione senza aver preparato nulla', 'board.jpg', 70],
          ['Fare gli auguri di compleanno in ritardo di un mese', 'bday.jpg', 71],
          ['Svenire o avere un mancamento lieve al proprio matrimonio', 'faint.jpg', 72],
          ['Chiedere "Quando partorisci?" a una donna che non è incinta', 'pregnant.jpg', 73],
          ['Far cadere e rompere una bottiglia di vetro al supermercato', 'bottle.jpg', 74],
          ['Rimanere chiuso fuori casa in ciabatte e pigiama', 'locked-out.jpg', 75],
          ['Lasciare il microfono acceso durante una call e dire qualcosa di privato', 'mic.jpg', 76],
          ['Entrare nel bagno del sesso opposto in un ristorante', 'wrong-bathroom.jpg', 77],
          ['Chiamare la nuova partner con il nome della ex', 'wrong-name.jpg', 78],
          ['Essere sorpresi a frugare nell\'armadietto dei medicinali di un ospite', 'meds.jpg', 79],
          ['Vomitare in macchina di un amico appena saliti', 'puke.jpg', 80],
          ['Sbattere contro una porta a vetri pulitissima', 'glass-door.jpg', 81],
          ['Rompersi il tacco o una scarpa nel bel mezzo di un galà', 'heel.jpg', 82],
          ['Farsi cadere il vassoio pieno in una mensa affollata', 'tray.jpg', 83],
          ['Inoltrare uno screenshot della chat... alla persona con cui stavi chattando', 'screenshot.jpg', 84],
          ['Il costume da bagno ti si sfila scivolando sull\'acquascivolo', 'swimsuit.jpg', 85],
          ['Avere un evidente segno di dentifricio sui vestiti a un appuntamento', 'toothpaste.jpg', 86],
          ['Scoprire che hai tenuto un seminario intero con la patta aperta', 'seminar.jpg', 87],
          ['Invito respinto da un VIP davanti alle telecamere', 'vip.jpg', 88],
          ['Essere rifiutati platealmente a una proposta di matrimonio pubblica', 'proposal.jpg', 89],
          ['La carta igienica usata rimane attaccata al vestito uscendo dal bagno chimico', 'tp-dress.jpg', 90],
          ['Sputare accidentalmente in faccia a qualcuno mentre parli animatamente', 'spit.jpg', 91],
          ['Confondere il padre della fidanzata per il cameriere', 'father.jpg', 92],
          ['Attivare l\'allarme antincendio dell\'hotel per essersi asciugati i capelli', 'fire.jpg', 93],
          ['Cadere rovinosamente sul tapis roulant in palestra davanti a tutti', 'gym.jpg', 94],
          ['Perdere i pantaloni del pigiama mentre scappi da un cane nel vicinato', 'dog.jpg', 95],
          ['Ruttare fragorosamente durante un minuto di silenzio istituzionale', 'burp.jpg', 96],
          ['Andare in bagno con il microfono ad archetto ancora acceso sul palco', 'stage.jpg', 97],
          ['Inviare un insulto pesantissimo al capo credendo fosse il tuo migliore amico', 'insult.jpg', 98],
          ['Essere scoperti in bagno in un momento di intimità totale dalla suocera', 'mother-in-law.jpg', 99],
          ['Scambiarsi i bagagli all\'aeroporto e accorgersene solo al ritorno in hotel', 'luggage.jpg', 100]
        ];
        
        const stmt = db.prepare("INSERT INTO cards (name, image_url, misery_index) VALUES (?, ?, ?)");
        initialCards.forEach(card => stmt.run(card));
        stmt.finalize();
        console.log("Database popolato con 100 carte iniziali.");
      }
    });

    // Aggiungo anche gli utenti di default per poter fare login (pass: 'password')
    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
      if (row.count === 0) {
        // La password per entrambi è "password" (hash generato con un salt 'test-salt')
        // In produzione useresti un tool per generare il salt vero, questo è solo mock.
        const users = [
          ['giocatore1', '2ccb72a6a617651a66b26d36e8b4e72332616f9f0d11019183cc9c2d1b73e5f2', 'test-salt'],
          ['giocatore2', '2ccb72a6a617651a66b26d36e8b4e72332616f9f0d11019183cc9c2d1b73e5f2', 'test-salt']
        ];
        
        const stmt = db.prepare("INSERT INTO users (username, hash, salt) VALUES (?, ?, ?)");
        users.forEach(user => stmt.run(user));
        stmt.finalize();
        console.log("Database popolato con utenti fittizi.");
      }
    });
  });

  // Tabella Partite
  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT CHECK(status IN ('won', 'lost')) NOT NULL,
    score INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Tabella Round della partita
  db.run(`CREATE TABLE IF NOT EXISTS match_rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    round_number INTEGER, 
    guessed BOOLEAN NOT NULL,
    FOREIGN KEY(match_id) REFERENCES matches(id),
    FOREIGN KEY(card_id) REFERENCES cards(id)
  )`);
});

export default db;