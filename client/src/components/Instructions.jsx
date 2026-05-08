import { Container, Card } from 'react-bootstrap';

function Instructions() {
  return (
    <Container className="mt-5">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-4"><h2>📖 Regole del Gioco della Sfortuna</h2></Card.Title>
          <h5>Lo Scopo del Gioco</h5>
          <p>Devi raccogliere <strong>6 carte</strong> posizionando correttamente gli Eventi Imbarazzanti nella tua linea della sfortuna.</p>
          
          <h5>Come si gioca</h5>
          <ul>
            <li>Inizi con 3 carte scoperte, ordinate per il loro <strong>Indice di Sfortuna</strong> (da 1 a 100).</li>
            <li>Ad ogni round, ti verrà proposto un nuovo Evento Imbarazzante, ma il suo Indice di Sfortuna sarà <strong>nascosto</strong>.</li>
            <li>Hai <strong>30 secondi</strong> per decidere dove si colloca quel nuovo evento rispetto alle carte che hai già in mano.</li>
            <li>Clicca sul pulsante <strong>"+"</strong> nello spazio corretto.</li>
            <li>Se indovini, ottieni la carta e vai avanti. Se sbagli (o scade il tempo), accumuli un errore.</li>
          </ul>

          <h5>Fine della Partita</h5>
          <p>Vinci se riesci a posizionare correttamente 6 carte. Perdi se commetti <strong>3 errori</strong>.</p>
          <hr />
          <p className="text-muted text-center mb-0">
            <em>Nota: I visitatori non registrati possono giocare solo una partita Demo della durata di un singolo round.</em>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Instructions;