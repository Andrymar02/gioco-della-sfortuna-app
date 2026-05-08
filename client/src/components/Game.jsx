// client/src/components/Game.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Alert, Badge } from 'react-bootstrap';
import * as API from '../API';

function Game({ user }) {
  // Stati del gioco
  const [gameState, setGameState] = useState('loading'); // 'loading', 'playing', 'feedback', 'gameover'
  const [hand, setHand] = useState([]); // Le carte in possesso del giocatore
  const [currentCard, setCurrentCard] = useState(null); // La carta da indovinare
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState(0);
  const [roundFeedback, setRoundFeedback] = useState(null); // Oggetto con l'esito del round
  const [matchHistory, setMatchHistory] = useState([]); // Array per salvare i round per il db

  // Inizia una nuova partita
  const startNewGame = async () => {
    setGameState('loading');
    setErrors(0);
    setMatchHistory([]);
    try {
      // 1. Prendi 3 carte iniziali
      let initialCards = await API.getInitialCards();
      // Ordinale per indice di sfortuna crescente
      initialCards.sort((a, b) => a.misery_index - b.misery_index);
      setHand(initialCards);

      // 2. Prendi la prima carta da indovinare (escludendo gli ID delle carte iniziali)
      const excludedIds = initialCards.map(c => c.id);
      const nextCard = await API.getNextCard(excludedIds);
      setCurrentCard(nextCard);

      setTimer(30);
      setGameState('playing');
    } catch (err) {
      console.error(err);
    }
  };

  // Carica il gioco all'avvio
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gestione del Timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (gameState === 'playing' && timer === 0) {
      // Tempo scaduto!
      handleGuess(-1); // -1 indica timeout
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, timer]);

  // Gestisce la scelta dell'utente
  const handleGuess = async (slotIndex) => {
    setGameState('loading'); // Pausa per evitare doppi click
    
    try {
      // Chiede al server il vero misery_index della carta
      const fullCard = await API.getCardDetails(currentCard.id);
      const realIndex = fullCard.misery_index;
      
      let isCorrect = false;

      // Verifica se la posizione scelta è corretta (timeout escluso)
      if (slotIndex !== -1) {
        // Limite inferiore (se è il primo slot, è 0)
        const lowerBound = slotIndex === 0 ? 0 : hand[slotIndex - 1].misery_index;
        // Limite superiore (se è l'ultimo slot, è infinito/101)
        const upperBound = slotIndex === hand.length ? 101 : hand[slotIndex].misery_index;

        if (realIndex > lowerBound && realIndex < upperBound) {
          isCorrect = true;
        }
      }

      // Aggiorna lo stato in base all'esito
      let newHand = [...hand];
      let newErrors = errors;

      if (isCorrect) {
        newHand.push(fullCard);
        newHand.sort((a, b) => a.misery_index - b.misery_index); // Riordina la mano
      } else {
        newErrors += 1;
      }

      // Salva il round per la cronologia
      const newRound = {
        cardId: fullCard.id,
        roundNumber: matchHistory.length + 1,
        guessed: isCorrect
      };
      const updatedHistory = [...matchHistory, newRound];

      setHand(newHand);
      setErrors(newErrors);
      setMatchHistory(updatedHistory);
      setRoundFeedback({ 
        correct: isCorrect, 
        timeout: slotIndex === -1,
        card: fullCard 
      });
      setGameState('feedback');

    } catch (err) {
      console.error("Errore durante la verifica", err);
    }
  };

  // Prepara il prossimo round o chiude la partita
  const proceedToNextRound = async () => {
    setGameState('loading');
    
    const isDemo = !user; // Se utente anonimo, è una demo

    // Condizioni di fine partita
    if (hand.length === 6 || errors === 3 || isDemo) {
      // Se è loggato, salva la partita nel DB
      if (user) {
        const matchData = {
          date: new Date().toISOString(),
          status: hand.length === 6 ? 'won' : 'lost',
          score: hand.length,
          rounds: matchHistory
        };
        await API.saveMatch(matchData);
      }
      setGameState('gameover');
      return;
    }

    // Altrimenti, continua col prossimo round
    try {
      const excludedIds = hand.map(c => c.id);
      const nextCard = await API.getNextCard(excludedIds);
      setCurrentCard(nextCard);
      setTimer(30);
      setGameState('playing');
    } catch (err) {
      console.error(err);
    }
  };

  // --- RENDERIZZAZIONE DELLE FASI DI GIOCO ---

  if (gameState === 'loading') {
    return <div className="text-center mt-5"><h4>Caricamento in corso...</h4></div>;
  }

  if (gameState === 'gameover') {
    const won = hand.length === 6;
    return (
      <Container className="text-center mt-4">
        {won ? (
          <h2 className="text-success">🎉 Hai Vinto! 🎉</h2>
        ) : (
          <h2 className="text-danger">💀 Hai Perso! 💀</h2>
        )}
        <p className="mt-3 text-muted">
          {!user ? "Questa era una Demo. Accedi per giocare partite complete e salvare i tuoi risultati!" : `Hai raccolto ${hand.length} carte con ${errors} errori.`}
        </p>
        <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
          {hand.map((c, i) => (
            <Card key={i} style={{ width: '12rem' }} className="shadow-sm border-secondary">
              <Card.Img variant="top" src={`https://placehold.co/400x300/e9ecef/495057?text=${c.image_url}`} alt="Immagine carta" />
              <Card.Body>
                <Card.Title className="fs-6">{c.name}</Card.Title>
                <hr/>
                <h3 className="text-center text-danger">{c.misery_index}</h3>
              </Card.Body>
            </Card>
          ))}
        </div>
        <Button variant="primary" size="lg" className="mt-5" onClick={startNewGame}>
          Gioca Ancora
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Intestazione: Info partita e Carta corrente */}
      <Row className="mb-4">
        <Col md={4} className="text-center">
          <Alert variant="info">
            <h5>Errori: {errors} / 3</h5>
            <h5>Carte: {hand.length} / 6</h5>
          </Alert>
          {gameState === 'playing' && (
            <>
              <ProgressBar 
                now={(timer / 30) * 100} 
                variant={timer > 10 ? "success" : "danger"} 
                className="mb-2" 
              />
              <h5>Tempo: {timer}s</h5>
            </>
          )}
        </Col>
        
        <Col md={8}>
          {gameState === 'playing' && currentCard && (
             <Card className="text-center shadow bg-warning text-dark border-0">
               <Card.Body>
                 <Card.Text>Dove si colloca questo evento?</Card.Text>
                 <Card.Title className="fs-4">{currentCard.name}</Card.Title>
                 <Card.Text className="text-muted mt-2">Indice nascosto: ???</Card.Text>
               </Card.Body>
             </Card>
          )}

          {gameState === 'feedback' && roundFeedback && (
            <Card className={`text-center shadow text-white ${roundFeedback.correct ? 'bg-success' : 'bg-danger'}`}>
              <Card.Body>
                <Card.Title>
                  {roundFeedback.timeout ? "⏰ Tempo Scaduto!" : (roundFeedback.correct ? "✅ Corretto!" : "❌ Sbagliato!")}
                </Card.Title>
                <Card.Text>
                  L'evento "{roundFeedback.card.name}" aveva un indice di sfortuna pari a <strong>{roundFeedback.card.misery_index}</strong>.
                </Card.Text>
                <Button variant="light" onClick={proceedToNextRound}>Continua</Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Plancia di gioco: Carte in possesso e "Slot" dove inserirle */}
      <h4 className="text-center mb-4">Le tue Carte (Indice Crescente)</h4>
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
        
        {/* Generiamo dinamicamente gli slot e le carte */}
        {hand.map((card, index) => (
          <React.Fragment key={card.id}>
            {/* Bottone Slot prima della carta */}
            <Button 
              variant="outline-primary" 
              className="rounded-circle fw-bold"
              style={{ width: '40px', height: '40px' }}
              disabled={gameState !== 'playing'}
              onClick={() => handleGuess(index)}
            >
              +
            </Button>
            
            {/* Carta in possesso */}
            <Card style={{ width: '12rem', minHeight: '10rem' }} className="shadow-sm border-secondary">
              <Card.Img variant="top" src={`https://placehold.co/400x300/e9ecef/495057?text=${card.image_url}`} alt="Immagine carta" />
              <Card.Body className="d-flex flex-column justify-content-between">
                <Card.Text className="small">{card.name}</Card.Text>
                <h4 className="text-center text-danger mb-0">{card.misery_index}</h4>
              </Card.Body>
            </Card>
          </React.Fragment>
        ))}

        {/* L'ultimo slot dopo l'ultima carta */}
        <Button 
          variant="outline-primary" 
          className="rounded-circle fw-bold"
          style={{ width: '40px', height: '40px' }}
          disabled={gameState !== 'playing'}
          onClick={() => handleGuess(hand.length)}
        >
          +
        </Button>
      </div>
    </Container>
  );
}

export default Game;