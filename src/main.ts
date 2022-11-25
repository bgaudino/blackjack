import Card from './cards/card';
import Deck from './cards/deck';
import {Hand, PlayerHand, DealerHand} from './cards/hand';
import './style.css';

type Outcome = 'win' | 'lose' | 'push';

// Click handlers
const hitButton = document.querySelector<HTMLButtonElement>('#hit');
const standButton = document.querySelector<HTMLButtonElement>('#stand');
const dealButton = document.querySelector<HTMLButtonElement>('#deal');
const splitButton = document.querySelector<HTMLButtonElement>('#split');
const continueButton = document.querySelector<HTMLButtonElement>('#continue');
const clearScoreButton = document.querySelector<HTMLButtonElement>('#clear');
hitButton!.onclick = hit;
standButton!.onclick = stand;
dealButton!.onclick = handleGameStart;
splitButton!.onclick = split;
continueButton!.onclick = handleSplit;
clearScoreButton!.onclick = clearScore;

// DOM elements
const playerHandElement = document.querySelector<HTMLDivElement>('#playerHand');
const dealerHandElement = document.querySelector<HTMLDivElement>('#dealerHand');
const playerPointsElement =
  document.querySelector<HTMLDivElement>('#playerPoints');
const dealerPointsElement =
  document.querySelector<HTMLDivElement>('#dealerPoints');
const feedbackElement = document.querySelector<HTMLHeadingElement>('#result');

// State
interface State {
  wins: number;
  losses: number;
  isOver: boolean;
  split: 0 | 1 | null;
  splitHands: Hand[];
}
const {wins, losses} = getPersistedRecord();
const state: State = {
  wins,
  losses,
  isOver: false,
  split: null,
  splitHands: [],
};
updateRecord();

// Cards
let deck = new Deck();
const playerHand = new PlayerHand();
const dealerHand = new DealerHand();
handleGameStart();

// Actions
function hit() {
  splitButton!.hidden = true;
  const numCards = playerHand.cards.length > 0 ? 1 : 2;
  playerHand.addCards(deck.deal(numCards));
  renderPlayerHand();

  if (playerHand.isBusted()) {
    if (state.split === null) {
      handleBust();
      return;
    }
    if (state.split === 0) {
      state.split = 1;
      continueButton!.hidden = false;
      hideActions();
      return;
    }
    state.split = null;
    handleGameOver();
  }
}

function stand() {
  if (state.split === 0) {
    state.split = 1;
    continueButton!.hidden = false;
    hideActions();
    return;
  }

  dealerHand.play(deck);
  renderDealerHand();
  handleGameOver();
}

function split() {
  splitButton!.hidden = true;
  if (!playerHand.isSplitable()) return;

  for (const card of playerHand.cards) {
    state.splitHands.push(new Hand([card]));
  }

  state.split = 0;
  handleSplit();
}

function handleSplit() {
  const index = state.split;
  if (index === null) return;
  playerHand.empty();

  playerHand.addCards(state.splitHands[index].cards);
  playerHand.addCards(deck.deal());

  renderPlayerHand();
  showActions();
  continueButton!.hidden = true;
}

// Results
function handleBlackjack() {
  handleGameOver();
}

function handleBust() {
  handleGameOver();
}

function declareWinner() {
  if (state.splitHands.length > 0) {
    declareSplitWinners();
    return;
  }
  const outcome = determineOutcome(playerHand);
  switch (outcome) {
    case 'lose':
      dealerWins();
      break;
    case 'win':
      playerWins();
      break;
    case 'push':
      push();
      break;
  }
}

function playerWins() {
  feedbackElement!.innerHTML = '<span class="win">You Win!</span>';
  state.wins++;
  updateRecord();
}

function dealerWins() {
  feedbackElement!.innerHTML = '<span class="lose">You Lose!</span>';
  state.losses++;
  updateRecord();
}

function push() {
  feedbackElement!.innerHTML = '<span class="push">Push</span>';
}

function determineOutcome(hand: Hand): Outcome {
  if (
    hand.isBusted() ||
    (dealerHand.value() > hand.value() && !dealerHand.isBusted())
  ) {
    return 'lose';
  }
  if (
    dealerHand.isBusted() ||
    (hand.value() > dealerHand.value() && !hand.isBusted())
  ) {
    return 'win';
  }
  return 'push';
}

function declareSplitWinners() {
  const feedback: string[] = [];
  for (const [index, hand] of Object.entries(state.splitHands)) {
    const handName = `Hand ${Number(index) + 1}`;
    const outcome = determineOutcome(hand);
    switch (outcome) {
      case 'win':
        feedback.push(`${handName}&nbsp;<span class="win">Won!</span>`);
        state.wins++;
        break;
      case 'lose':
        feedback.push(`${handName}&nbsp;<span class="lose">Lost!</span>`);
        state.losses++;
        break;
      case 'push':
        feedback.push(`${handName} is a&nbsp;<span class="push">Push</span>`);
        break;
    }
  }
  feedbackElement!.innerHTML = feedback.join('<br><br>');

  updateRecord();
  updatePersistedRecord();
}

// render
function updateRecord() {
  document.querySelector<HTMLSpanElement>('#losses')!.innerHTML =
    state.losses.toString();
  document.querySelector<HTMLSpanElement>('#wins')!.innerHTML =
    state.wins.toString();
}

function renderPlayerHand() {
  render(playerHand);
}

function renderDealerHand() {
  render(dealerHand);
}

function getCardMarkup(cards: Card[], active = true) {
  return cards.reduce(
    (prev, curr) =>
      `${prev}<span class="playing-card ${active ? 'active' : 'inactive'} ${
        curr.suit.name
      }">${curr.emoji()}</span>`,
    ''
  );
}

function render(hand: Hand) {
  const isDealer = hand instanceof DealerHand;
  if (state.splitHands.length > 0 && !isDealer) {
    renderSplitHands();
    return;
  }

  const dealerCardHidden = isDealer && !state.isOver;
  const cards = !dealerCardHidden ? hand.cards : hand.cards.slice(1);
  let cardMarkup = getCardMarkup(cards);
  if (dealerCardHidden) {
    cardMarkup = `<span class="playing-card">&#127136;</span>` + cardMarkup;
  }
  const handElement = isDealer ? dealerHandElement : playerHandElement;
  handElement!.innerHTML = cardMarkup;

  const points = dealerCardHidden ? hand.valueShowing() : hand.value();
  const feedback = points > 21 ? ' Busted!' : points == 21 ? ' Blackjack!' : '';
  const pointsMarkup = `${points}${feedback}`;
  const pointsElement = isDealer ? dealerPointsElement : playerPointsElement;
  pointsElement!.innerHTML = pointsMarkup;
}

function renderSplitHands() {
  if (state.split === null) return;

  state.splitHands[state.split].empty();
  state.splitHands[state.split].addCards(playerHand.cards);

  playerPointsElement!.innerHTML = state.splitHands
    .map((h) => h.value())
    .join(',');

  const splitMarkup = state.splitHands
    .map(
      (h, i) =>
        `<span class="split">${getCardMarkup(
          h.cards,
          state.isOver || i === state.split
        )}</span>`
    )
    .join('');

  playerHandElement!.innerHTML = splitMarkup;
}

function showActions() {
  hitButton!.hidden = false;
  standButton!.hidden = false;
  dealButton!.hidden = true;
  splitButton!.hidden = state.split !== null || !playerHand.isSplitable();
}

function hideActions() {
  hitButton!.hidden = true;
  standButton!.hidden = true;
  splitButton!.hidden = true;
}

// Game start end
function handleGameStart() {
  state.isOver = false;
  state.split = null;
  state.splitHands = [];
  deck = new Deck();
  playerHand.empty();
  dealerHand.empty();

  for (let i = 0; i < 2; i++) {
    playerHand.addCards(deck.deal());
    dealerHand.addCards(deck.deal());
  }

  playerHandElement!.innerHTML = '';
  dealerHandElement!.innerHTML = '';
  feedbackElement!.innerHTML = '';
  showActions();

  renderDealerHand();
  renderPlayerHand();

  if (playerHand.isBlackjack()) handleBlackjack();
}

function handleGameOver() {
  state.isOver = true;
  continueButton!.hidden = true;
  dealButton!.hidden = false;
  hideActions();
  renderDealerHand();
  renderPlayerHand();
  declareWinner();
  updatePersistedRecord();
}

// Local storage
function getPersistedRecord() {
  const persistedWins = localStorage.getItem('wins');
  const persistedLosses = localStorage.getItem('losses');
  let wins = 0;
  let losses = 0;
  if (persistedWins && persistedLosses) {
    try {
      wins = JSON.parse(persistedWins);
      losses = JSON.parse(persistedLosses);
      if (Number.isNaN(wins) || Number.isNaN(losses)) {
        clearPersistedRecord();
        wins = 0;
        losses = 0;
      }
    } catch {
      clearPersistedRecord();
    }
  } else {
    clearPersistedRecord();
  }
  return {
    wins,
    losses,
  };
}

function updatePersistedRecord() {
  localStorage.setItem('wins', JSON.stringify(state.wins));
  localStorage.setItem('losses', JSON.stringify(state.losses));
}

function clearPersistedRecord() {
  localStorage.removeItem('wins');
  localStorage.removeItem('losses');
}

function clearScore() {
  state.wins = 0;
  state.losses = 0;
  updateRecord();
  clearPersistedRecord();
}
