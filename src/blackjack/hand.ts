import Hand from '../cards/hand';
import Deck from '../cards/deck';
import BlackjackCard from './card';

export class BlackjackHand extends Hand {
  declare cards: BlackjackCard[];

  hardValue() {
    return this.cards.reduce((prev, curr) => prev + curr.value(), 0);
  }

  softValue() {
    return this.cards.reduce(
      (prev, curr) => prev + (curr.isAce() ? 1 : curr.value()),
      0
    );
  }

  value() {
    let sum = this.cards.reduce((prev, curr) => prev + curr.value(), 0);

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

  isSoft() {
    const hardValue = this.hardValue();
    const softValue = this.softValue();
    return hardValue < 21 && hardValue !== softValue;
  }

  isHard() {
    return !this.isSoft();
  }

  html(active = true) {
    const hand = this.cards.reduce(
      (prev, curr) =>
        `${prev}<span class="playing-card ${active ? 'active' : 'inactive'} ${
          curr.suit.name
        }">${curr.html}</span>`,
      ''
    );
    const feedback = this.isBlackjack()
      ? ' Blackjack!'
      : this.isBusted()
      ? ' Bust!'
      : '';
    return `
      <div>
        <div class="points">${this.value()}${feedback}</div>
        <div>${hand}</div>
      </div>
    `;
  }
}

export class PlayerHand extends BlackjackHand {
  isSplitable() {
    if (this.cards.length !== 2 || this.cards[0].rank !== this.cards[1].rank) {
      return false;
    }
    return true;
  }
}

export class DealerHand extends BlackjackHand {
  play(deck: Deck) {
    while (this.value() < 17) {
      this.addCards(deck.deal());
    }
  }

  valueShowing() {
    return this.cards[this.cards.length - 1].value();
  }

  html(isRevealed = false) {
    if (isRevealed) return super.html(true);
    const hand = `<span class="playing-card">&#127136;</span><span class="playing-card ${this.cards[1].suit.name}">${this.cards[1].html}</span>`;
    return `
      <div>
        <div class="points">${this.valueShowing()}</div>
        <div>${hand}</div>
      </div>
    `;
  }
}
