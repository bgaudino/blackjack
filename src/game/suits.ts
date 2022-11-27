export const SPADES = {
  name: 'spades',
  symbol: '♠️',
  htmlSymbolOffset: 0,
};

export const HEARTS = {
  name: 'hearts',
  symbol: '❤️',
  htmlSymbolOffset: 16,
};

export const DIAMONDS = {
  name: 'diamonds',
  symbol: '♦️',
  rank: 2,
  htmlSymbolOffset: 32,
};

export const CLUBS = {
  name: 'clubs',
  symbol: '️♣️',
  htmlSymbolOffset: 48,
};

export type Suit =
  | typeof SPADES
  | typeof HEARTS
  | typeof DIAMONDS
  | typeof CLUBS;
