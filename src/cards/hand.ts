import Card from './card';

export default class Hand {
  cards: Card[];

  constructor(cards: Card[] = []) {
    this.cards = cards;
  }

  addCards(cards: Card[]) {
    this.cards = [...this.cards, ...cards];
  }

  empty() {
    this.cards = [];
  }
}
