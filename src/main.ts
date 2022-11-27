import Game from './game/game';
import './style.css';

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
  playerPoints: document.querySelector<HTMLDivElement>('#playerPoints'),
  dealerPoints: document.querySelector<HTMLDivElement>('#dealerPoints'),
  feedback: document.querySelector<HTMLHeadingElement>('#result'),
};

const game = new Game(buttons, elements);
game.start();
