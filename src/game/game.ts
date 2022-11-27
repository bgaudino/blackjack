import Deck from './deck';
import {DealerHand, Hand, PlayerHand} from './hand';
import {Buttons, DOMElements, Outcome} from './types';

export default class Game {
  deck: Deck;
  playerHand: PlayerHand;
  dealerHand: DealerHand;
  splitHands: Hand[];
  splitIndex: null | 0 | 1;
  isOver: boolean;
  wins: number;
  losses: number;
  buttons: Buttons;
  elements: DOMElements;

  constructor(buttons: Buttons, elements: DOMElements) {
    this.deck = new Deck();
    this.playerHand = new PlayerHand();
    this.dealerHand = new DealerHand();
    this.splitHands = [];
    this.splitIndex = null;
    this.isOver = false;

    try {
      this.wins = JSON.parse(localStorage.getItem('wins') || '0');
      this.losses = JSON.parse(localStorage.getItem('losses') || '0');
    } catch {
      this.wins = 0;
      this.losses = 0;
    }
    this.renderRecord();

    this.buttons = buttons;
    this.elements = elements;

    this.start = this.start.bind(this);
    this.buttons.deal!.onclick = this.start;

    this.hit = this.hit.bind(this);
    this.buttons.hit!.onclick = this.hit;

    this.beginSplit = this.beginSplit.bind(this);
    this.buttons.split!.onclick = this.beginSplit;

    this.stand = this.stand.bind(this);
    this.buttons.stand!.onclick = this.stand;

    this.suggest = this.suggest.bind(this);
    this.buttons.suggest!.onclick = this.suggest;

    this.reset = this.reset.bind(this);
    this.buttons.reset!.onclick = this.reset;
  }

  start() {
    this.isOver = false;
    this.elements.feedback!.innerHTML = '';
    this.deck.reset();
    this.playerHand.empty();
    this.dealerHand.empty();
    this.splitHands = [];
    this.splitIndex = null;
    this.deal();
    if (this.playerHand.isBlackjack()) {
      this.end();
    }
  }

  end() {
    this.isOver = true;
    if (!this.playerHand.isBusted()) {
      this.dealerHand.play(this.deck);
    }
    this.renderHand(this.dealerHand);
    this.disableActions();
    if (this.splitIndex === null) {
      const outcome = this.determineOutcome(this.playerHand);
      this.renderOutcome(outcome);
    } else {
      const outcomes = this.splitHands.map((h) => this.determineOutcome(h));
      this.renderSplitOutcomes(outcomes);
    }
    this.renderRecord();
    this.persistRecord();
    this.buttons.deal!.disabled = false;
  }

  deal() {
    for (let i = 0; i < 2; i++) {
      this.dealToPlayer();
      this.dealToDealer();
    }
    this.renderHand(this.dealerHand);
    this.renderHand(this.playerHand);
    this.buttons.deal!.disabled = true;
    this.enableActions();
  }

  dealToPlayer() {
    this.playerHand.addCards(this.deck.deal());
  }

  dealToDealer() {
    this.dealerHand.addCards(this.deck.deal());
  }

  hit() {
    this.playerHand.addCards(this.deck.deal());
    this.renderHand(this.playerHand);

    if (this.playerHand.isBusted() || this.playerHand.isBlackjack()) {
      if (this.splitIndex === 0) {
        this.splitIndex = 1;
        this.continueSplit();
        return;
      }
      this.end();
    }
  }

  stand() {
    if (this.splitIndex === 0) {
      this.splitIndex = 1;
      this.continueSplit();
      return;
    }
    this.end();
  }

  beginSplit() {
    for (const card of this.playerHand.cards) {
      this.splitHands.push(new Hand([card]));
    }
    this.splitIndex = 0;
    this.continueSplit();
  }

  continueSplit() {
    if (this.splitIndex === null) return;
    this.playerHand.empty();

    this.playerHand.addCards([
      ...this.splitHands[this.splitIndex].cards,
      ...this.deck.deal(),
    ]);
    this.renderSplitHands();
    this.enableActions();
  }

  determineOutcome(hand: Hand): Outcome {
    const playerValue = hand.value();
    const dealerValue = this.dealerHand.value();
    if (
      hand.isBusted() ||
      (dealerValue > playerValue && !this.dealerHand.isBusted())
    ) {
      this.losses++;
      return 'lose';
    }
    if (this.dealerHand.isBusted() || hand.value() > this.dealerHand.value()) {
      this.wins++;
      return 'win';
    }
    return 'push';
  }

  disableActions() {
    const {hit, stand, split, suggest} = this.buttons;
    [hit, stand, split, suggest].forEach((b) => (b!.disabled = true));
  }

  enableActions() {
    const {hit, stand, split, suggest} = this.buttons;
    [hit, stand, suggest].forEach((b) => (b!.disabled = false));
    split!.disabled =
      !this.playerHand.isSplitable() || this.splitIndex !== null;
  }

  getActiveHand() {
    if (this.splitIndex === null) {
      return this.playerHand;
    }
    return this.splitHands[this.splitIndex];
  }

  suggest() {
    this.buttons[this.getSuggestion()]?.focus();
  }

  getSuggestion() {
    const hand = this.getActiveHand();
    const playerValue = hand.value();
    const dealerValue = this.dealerHand.cards[1].value();

    if (hand instanceof PlayerHand && hand.isSplitable()) {
      const splitValue = hand.cards[0].rank;
      if (splitValue === 11 || splitValue === 8) {
        return 'split';
      }
      if (splitValue === 9) {
        return dealerValue === 7 || dealerValue >= 10 ? 'stand' : 'split';
      }
      if (splitValue === 7) {
        return dealerValue < 8 ? 'split' : dealerValue === 10 ? 'stand' : 'hit';
      }
      if (splitValue === 6) {
        return dealerValue > 7 ? 'hit' : 'split';
      }
      if (splitValue === 4) {
        return dealerValue > 3 && dealerValue < 7 ? 'split' : 'hit';
      }
      if (splitValue === 3) {
        return dealerValue > 8 ? 'hit' : 'split';
      }
      if (splitValue === 2) {
        return dealerValue > 7 ? 'hit' : 'split';
      }
    }

    if (hand.isHard()) {
      if (playerValue >= 17) {
        return 'stand';
      }
      if (playerValue >= 13) {
        return dealerValue > 6 ? 'hit' : 'stand';
      }
      if (playerValue == 12) {
        return dealerValue < 4 || dealerValue > 6 ? 'hit' : 'stand';
      }
      return 'hit';
    }

    if (playerValue >= 19) {
      return 'stand';
    }
    if (playerValue == 18) {
      return dealerValue > 8 && dealerValue < 11 ? 'hit' : 'stand';
    }
    return 'hit';
  }

  renderHand(hand: Hand) {
    const isDealer = hand instanceof DealerHand;
    if (this.splitHands.length > 0 && !isDealer) {
      this.renderSplitHands();
      return;
    }

    if (isDealer) {
      this.elements.dealerHand!.innerHTML = this.dealerHand.html(this.isOver);
    } else {
      this.elements.playerHand!.innerHTML = this.playerHand.html();
    }
  }

  renderSplitHands() {
    if (this.splitIndex === null) return;
    this.splitHands[this.splitIndex].empty();
    this.splitHands[this.splitIndex].addCards(this.playerHand.cards);

    this.elements.playerHand!.innerHTML = this.splitHands
      .map(
        (h, i) => `<span class="split">${h.html(i === this.splitIndex)}</span>`
      )
      .join('');
  }

  renderRecord() {
    document.querySelector<HTMLSpanElement>('#wins')!.textContent =
      this.wins.toString();
    document.querySelector<HTMLSpanElement>('#losses')!.textContent =
      this.losses.toString();
  }

  renderOutcome(outcome: Outcome) {
    switch (outcome) {
      case 'win':
        this.elements.feedback!.innerHTML = 'You <span class="win">win!</span>';
        break;
      case 'lose':
        this.elements.feedback!.innerHTML =
          'You <span class="lose">lose!</span>';
        break;
      case 'push':
        this.elements.feedback!.innerHTML = '<span class="push">Push</span>';
        break;
    }
  }

  renderSplitOutcomes(outcomes: Outcome[]) {
    this.elements.feedback!.innerHTML = Object.entries(outcomes)
      .map(([index, outcome]) => {
        const feedback =
          outcome === 'win' ? 'won' : outcome === 'lose' ? 'lost' : 'pushed';
        return `Hand ${
          Number(index) + 1
        }: <span class="${outcome}">${feedback}</span></>`;
      })
      .join(' ');
  }

  persistRecord() {
    localStorage.setItem('wins', JSON.stringify(this.wins));
    localStorage.setItem('losses', JSON.stringify(this.losses));
  }

  reset() {
    this.wins = 0;
    this.losses = 0;
    this.persistRecord();
    this.renderRecord();
    this.start();
  }
}
