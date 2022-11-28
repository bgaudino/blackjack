import Card from '../cards/card';

export default class BlackjackCard extends Card {
  value() {
    if (this.isFaceCard()) {
      return 10;
    }
    if (this.isAce()) {
      return 11;
    }
    return this.rank;
  }
}
