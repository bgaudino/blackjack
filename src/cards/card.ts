import {Suit} from './suits';

export default class Card {
  suit: Suit;
  rank: number;
  html: string;

  constructor(suit: Suit, rank: number) {
    this.rank = rank;
    this.suit = suit;
    let code = 127136 + rank + suit.htmlSymbolOffset;
    if (rank >= 12) code++;
    this.html = `&#${code}`;
  }

  shortName() {
    return `${this.suit.symbol}${this.rankName()}`;
  }

  isFaceCard() {
    return this.rank > 10;
  }

  isAce() {
    return this.rank == 1;
  }

  rankName() {
    switch (this.rank) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return this.rank.toString();
    }
  }
}
