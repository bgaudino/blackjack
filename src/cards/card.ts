import {Suit} from './suits';

export default class Card {
  suit: Suit;
  value: number;

  constructor(suit: Suit, value: number) {
    this.value = value;
    this.suit = suit;
  }

  shortName() {
    return `${this.suit.symbol}${this.valueName()}`;
  }

  isFaceCard() {
    return this.value > 10;
  }

  isAce() {
    return this.value == 1;
  }

  valueName() {
    switch (this.value) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return this.value.toString();
    }
  }

  points() {
    if (this.isFaceCard()) {
      return 10;
    }
    if (this.isAce()) {
      return 11;
    }
    return this.value;
  }

  emoji() {
    let code = 127136 + this.value + this.suit.htmlSymbolOffset;
    if (this.value >= 12) code++;
    return `&#${code}`;
  }
}
