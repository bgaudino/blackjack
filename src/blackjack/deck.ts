import Deck from '../cards/deck';
import BlackjackCard from './card';

export default class BlackjackDeck extends Deck {
  cardClass = BlackjackCard;
  declare cards: BlackjackCard[];
}
