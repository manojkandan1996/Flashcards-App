let currentDeck = null;
let currentCard = null;
let correct = 0, incorrect = 0;

async function fetchDecks(){
  const res = await fetch('/api/decks');
  const decks = await res.json();
  const el = document.getElementById('deck-list');
  el.innerHTML = '';
  decks.forEach(d => {
    const li = document.createElement('li');
    li.textContent = d.name;
    li.onclick = () => selectDeck(d);
    el.append(li);
  });
}

async function addDeck(){
  const name = document.getElementById('new-deck-name').value;
  await fetch('/api/decks', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name})
  });
  document.getElementById('new-deck-name').value = '';
  fetchDecks();
}

async function selectDeck(d){
  currentDeck = d;
  document.getElementById('deck-name').textContent = d.name;
  document.getElementById('deck-section').classList.add('hidden');
  document.getElementById('cards-section').classList.remove('hidden');
  loadCards();
}

async function loadCards(){
  const res = await fetch(`/api/decks/${currentDeck.id}/cards`);
  const cards = await res.json();
  const el = document.getElementById('card-list');
  el.innerHTML = '';
  cards.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.question} → ${c.answer}`;
    el.append(li);
  });
}

async function addCard(){
  const q = document.getElementById('q-input').value;
  const a = document.getElementById('a-input').value;
  await fetch(`/api/decks/${currentDeck.id}/cards`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({question:q, answer:a})
  });
  document.getElementById('q-input').value = '';
  document.getElementById('a-input').value = '';
  loadCards();
}

async function startQuiz(){
  correct = incorrect = 0;
  document.getElementById('correct-count').textContent = correct;
  document.getElementById('incorrect-count').textContent = incorrect;
  document.getElementById('cards-section').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  loadNextCard();
}

async function loadNextCard(){
  const res = await fetch(`/api/quiz/${currentDeck.id}`);
  currentCard = await res.json();
  if (!currentCard?.question) {
    alert("No cards in deck!");
    return;
  }
  document.querySelector('.card').classList.remove('flip');
  document.querySelector('.front').textContent = currentCard.question;
  document.querySelector('.back').textContent = currentCard.answer;
  document.getElementById('feedback').textContent = '';
  document.getElementById('user-answer').value = '';
}

document.getElementById('submit-answer-btn').onclick = async () => {
  const userAnswer = document.getElementById('user-answer').value;
  const res = await fetch('/api/answer', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({card_id: currentCard.id, answer: userAnswer})
  });
  const json = await res.json();
  document.getElementById('feedback').textContent = json.correct ? '✅ Correct!' : `❌ Wrong! Answer: ${json.answer}`;
  if (json.correct) correct++; else incorrect++;
  document.getElementById('correct-count').textContent = correct;
  document.getElementById('incorrect-count').textContent = incorrect;
  document.querySelector('.card').classList.add('flip');
  setTimeout(loadNextCard, 1500);
};

document.getElementById('add-deck-btn').onclick = addDeck;
document.getElementById('add-card-btn').onclick = addCard;
document.getElementById('start-quiz-btn').onclick = startQuiz;

fetchDecks();
