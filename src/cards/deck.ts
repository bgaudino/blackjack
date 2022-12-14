import Card from './card';
import {SPADES, HEARTS, DIAMONDS, CLUBS} from './suits';

export default class Deck {
  suits = [SPADES, HEARTS, DIAMONDS, CLUBS] as const;
  ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
  cardClass = Card;
  cards: Card[];

  constructor() {
    this.cards = this.getInitialCards();
    this.shuffle();
  }

  deal(num = 1) {
    const hand = this.cards.slice(0, num);
    this.cards = this.cards.slice(num);
    return hand;
  }

  shuffle() {
    let currentIndex = this.cards.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [this.cards[currentIndex], this.cards[randomIndex]] = [
        this.cards[randomIndex],
        this.cards[currentIndex],
      ];
    }
  }

  reset() {
    this.cards = this.getInitialCards();
    this.shuffle();
  }

  getInitialCards() {
    return this.suits.flatMap((s) =>
      this.ranks.map((r) => new this.cardClass(s, r))
    );
  }
}
