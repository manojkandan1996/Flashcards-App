from flask import Flask, render_template, request, jsonify
from models import db, Deck, Card
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flashcards.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)



@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/decks', methods=['GET'])
def list_decks():
    decks = Deck.query.all()
    return jsonify([{'id': d.id, 'name': d.name} for d in decks])

@app.route('/api/decks', methods=['POST'])
def add_deck():
    name = request.json.get('name')
    deck = Deck(name=name)
    db.session.add(deck)
    db.session.commit()
    return jsonify({'id': deck.id, 'name': deck.name}), 201

@app.route('/api/decks/<int:deck_id>/cards', methods=['GET'])
def list_cards(deck_id):
    cards = Card.query.filter_by(deck_id=deck_id).all()
    return jsonify([{'id': c.id, 'question': c.question, 'answer': c.answer} for c in cards])

@app.route('/api/decks/<int:deck_id>/cards', methods=['POST'])
def add_card(deck_id):
    q = request.json.get('question')
    a = request.json.get('answer')
    card = Card(deck_id=deck_id, question=q, answer=a)
    db.session.add(card)
    db.session.commit()
    return jsonify({'id': card.id, 'question': q, 'answer': a}), 201

@app.route('/api/quiz/<int:deck_id>', methods=['GET'])
def quiz(deck_id):
    cards = Card.query.filter_by(deck_id=deck_id).all()
    if not cards:
        return jsonify([])
    card = random.choice(cards)
    return jsonify({'id': card.id, 'question': card.question})

@app.route('/api/answer', methods=['POST'])
def check_answer():
    card_id = request.json.get('card_id')
    user_ans = request.json.get('answer').trim().lower()
    card = Card.query.get(card_id)
    correct = card and card.answer.strip().lower() == user_ans
    return jsonify({'correct': correct, 'answer': card.answer if card else ''})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
