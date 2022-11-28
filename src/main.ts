import Blackjack from './cards/game';

const buttons = {
  hit: document.querySelector<HTMLButtonElement>('#hit'),
  stand: document.querySelector<HTMLButtonElement>('#stand'),
  deal: document.querySelector<HTMLButtonElement>('#deal'),
  split: document.querySelector<HTMLButtonElement>('#split'),
  reset: document.querySelector<HTMLButtonElement>('#reset'),
  suggest: document.querySelector<HTMLButtonElement>('#suggest'),
};

const elements = {
  playerHand: document.querySelector<HTMLDivElement>('#playerHand'),
  dealerHand: document.querySelector<HTMLDivElement>('#dealerHand'),
  feedback: document.querySelector<HTMLDivElement>('#result'),
  wins: document.querySelector<HTMLDivElement>('#wins'),
  losses: document.querySelector<HTMLDivElement>('#losses'),
};

const game = new Blackjack(buttons, elements);
game.start();
