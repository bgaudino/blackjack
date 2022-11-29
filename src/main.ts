import Blackjack from './blackjack/game';

const buttons = {
  hit: document.querySelector<HTMLButtonElement>('#hit'),
  stand: document.querySelector<HTMLButtonElement>('#stand'),
  deal: document.querySelector<HTMLButtonElement>('#deal'),
  split: document.querySelector<HTMLButtonElement>('#split'),
  reset: document.querySelector<HTMLButtonElement>('#reset'),
  suggest: document.querySelector<HTMLButtonElement>('#suggest'),
  updateBet: document.querySelector<HTMLElement>('#updateBet'),
};

const elements = {
  playerHand: document.querySelector<HTMLDivElement>('#playerHand'),
  dealerHand: document.querySelector<HTMLDivElement>('#dealerHand'),
  feedback: document.querySelector<HTMLDivElement>('#result'),
  bank: document.querySelector<HTMLDivElement>('#bank'),
  bet: document.querySelector<HTMLDivElement>('#bet'),
  betSelect: document.querySelector<HTMLSelectElement>('#betSelect'),
};

const game = new Blackjack(buttons, elements);
game.start();
