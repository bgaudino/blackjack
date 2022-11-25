import Card from './card';
import Deck from './deck';

export class Hand {
  cards: Card[];

  constructor(cards: Card[] = []) {
    this.cards = cards;
  }

  addCards(cards: Card[]) {
    this.cards = [...this.cards, ...cards];
  }

  value() {
    let sum = this.cards.reduce((prev, curr) => prev + curr.points(), 0);

    if (sum > 21) {
      for (const card of this.cards) {
        if (card.isAce()) {
          sum -= 10;
        }
        if (sum <= 21) break;
      }
    }

    return sum;
  }

  isBlackjack() {
    return this.value() == 21;
  }

  isBusted() {
    return this.value() > 21;
  }

  empty() {
    this.cards = [];
  }
}

export class PlayerHand extends Hand {
  isSplitable() {
    if (
      this.cards.length !== 2 ||
      this.cards[0].value !== this.cards[1].value
    ) {
      return false;
    }
    return true;
  }
}

export class DealerHand extends Hand {
  play(deck: Deck) {
    while (this.value() < 17) {
      this.addCards(deck.deal());
    }
  }

  valueShowing() {
    return this.cards[this.cards.length - 1].points();
  }
}
