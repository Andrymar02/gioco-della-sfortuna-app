const SERVER_URL = 'http://localhost:3001/api';

// Funzione base per gestire gli errori delle fetch
async function handleResponse(response) {
  if (response.ok) {
    return await response.json();
  } else {
    const errBody = await response.json();
    throw errBody.error || "Errore generico dal server";
  }
}

// --- AUTENTICAZIONE ---

export async function getUserInfo() {
  const response = await fetch(`${SERVER_URL}/sessions/current`, { credentials: 'include' });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Not authenticated');
  }
}

export async function logIn(credentials) {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function logOut() {
  await fetch(`${SERVER_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

// --- GIOCO ---

export async function getInitialCards() {
  const response = await fetch(`${SERVER_URL}/cards/initial`);
  return handleResponse(response);
}

export async function getNextCard(excludedIds = []) {
  const query = excludedIds.length > 0 ? `?exclude=${excludedIds.join(',')}` : '';
  const response = await fetch(`${SERVER_URL}/cards/next${query}`);
  return handleResponse(response);
}

export async function getCardDetails(id) {
  const response = await fetch(`${SERVER_URL}/cards/${id}`);
  return handleResponse(response);
}

// --- CRONOLOGIA ---

export async function saveMatch(matchData) {
  const response = await fetch(`${SERVER_URL}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchData),
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function getMatchHistory() {
  const response = await fetch(`${SERVER_URL}/matches`, { credentials: 'include' });
  return handleResponse(response);
}