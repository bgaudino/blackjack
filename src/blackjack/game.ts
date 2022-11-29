import Deck from './deck';
import {DealerHand, PlayerHand, BlackjackHand} from './hand';
import {Buttons, DOMElements, Outcome} from './types';

export default class Blackjack {
  deck: Deck;
  playerHand: PlayerHand;
  dealerHand: DealerHand;
  splitHands: BlackjackHand[];
  splitIndex: null | 0 | 1;
  isOver: boolean;
  bank: number;
  buttons: Buttons;
  bet: number;
  elements: DOMElements;

  constructor(buttons: Buttons, elements: DOMElements) {
    this.deck = new Deck();
    this.playerHand = new PlayerHand();
    this.dealerHand = new DealerHand();
    this.splitHands = [];
    this.splitIndex = null;
    this.isOver = false;

    try {
      this.bank = JSON.parse(localStorage.getItem('bank') || '0');
      this.bet = JSON.parse(localStorage.getItem('bet') || '0');
    } catch {
      this.bank = 1000;
      this.bet = 100;
    }
    if (this.bank === 0) this.bank = 1000;
    if (this.bet === 0 || this.bet > this.bank) this.bet = 100;

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
    this.buttons.restartGame!.onclick = this.reset;

    this.updateBet = this.updateBet.bind(this);
    this.elements.betSelect!.onchange = this.updateBet;

    this.toggleEdit = this.toggleEdit.bind(this);
    this.buttons.updateBet!.onclick = this.toggleEdit;
  }

  load() {
    this.renderPlaceholders();
    this.isOver = true;
    this.playerHand.empty();
    this.dealerHand.empty();
    this.buttons.deal!.disabled = false;
    this.disableActions();
    this.renderMoney();
  }

  start() {
    this.isOver = false;
    this.buttons.updateBet!.style.display = 'none';
    this.elements.feedback!.innerHTML = '';
    this.deck.reset();
    this.playerHand.empty();
    this.dealerHand.empty();
    this.splitHands = [];
    this.splitIndex = null;
    this.renderMoney();
    this.deal();
    if (this.playerHand.isBlackjack()) {
      this.end();
    }
  }

  end() {
    this.buttons.updateBet!.style.display = 'inline-block';
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
    this.renderMoney();
    this.persistMoney();
    if (this.bank <= 0) {
      this.bankrupt();
      return;
    }
    this.buttons.deal!.disabled = false;
  }

  openModal() {
    this.elements.dialog!.parentElement!.style.display = 'grid';
    this.elements.dialog!.open = true;
  }

  closeModal() {
    this.elements.dialog!.parentElement!.style.display = 'none';
    this.elements.dialog!.open = false;
  }

  bankrupt() {
    this.openModal();
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
    this.elements.feedback!.innerHTML = '';
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
    this.elements.feedback!.innerHTML = '';
    if (this.splitIndex === 0) {
      this.splitIndex = 1;
      this.continueSplit();
      return;
    }
    this.end();
  }

  beginSplit() {
    this.elements.feedback!.innerHTML = '';
    for (const card of this.playerHand.cards) {
      this.splitHands.push(new BlackjackHand([card]));
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
    if (this.playerHand.isBlackjack()) {
      this.stand();
    }
  }

  determineOutcome(hand: BlackjackHand): Outcome {
    const playerValue = hand.value();
    const dealerValue = this.dealerHand.value();
    if (
      hand.isBusted() ||
      (dealerValue > playerValue && !this.dealerHand.isBusted())
    ) {
      this.bank -= this.bet;
      return 'lose';
    }
    if (this.dealerHand.isBusted() || hand.value() > this.dealerHand.value()) {
      this.bank += this.bet;
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
    const suggestion = this.getSuggestion();
    this.buttons[suggestion]?.focus();
    this.elements.feedback!.innerHTML = suggestion;
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

  renderHand(hand: BlackjackHand) {
    const isDealer = hand instanceof DealerHand;
    if (isDealer) {
      this.elements.dealerHand!.innerHTML = this.dealerHand.html(this.isOver);
    } else if (this.splitHands.length > 0) {
      this.renderSplitHands();
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

  renderMoney() {
    this.elements.bank!.textContent = `$${this.bank}`;
    this.elements.bet!.textContent = `$${this.bet}`;
    this.elements.betSelect!.innerHTML = '';

    for (let i = 100; i <= this.bank; i += 100) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.text = `$${i}`;
      option.selected = i === this.bet;
      this.elements.betSelect?.appendChild(option);
    }

    if (this.bet > this.bank) this.bet = this.bank;
  }

  renderPlaceholders() {
    const placeholder = `
      <div>
        <div class="points">-</div>
        <div>
          <span class="playing-card">&#127136;</span>
          <span class="playing-card">&#127136;</span>
        </div>
      </div>
    `;
    this.elements.dealerHand!.innerHTML = placeholder;
    this.elements.playerHand!.innerHTML = placeholder;
  }

  updateBet(e: Event) {
    if (e.target instanceof HTMLSelectElement) {
      this.bet = Number(e.target.value);
    }
    this.renderMoney();
    this.toggleEdit();
    this.persistMoney();
  }

  toggleEdit() {
    this.elements.betSelect!.hidden = !this.elements.betSelect?.hidden;
    this.elements.bet!.hidden = !this.elements.bet?.hidden;
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
      .join('<br>');
  }

  persistMoney() {
    localStorage.setItem('bank', JSON.stringify(this.bank));
    localStorage.setItem('bet', JSON.stringify(this.bet));
  }

  reset() {
    this.bank = 1000;
    this.bet = 100;
    this.persistMoney();
    this.renderMoney();
    this.load();
    this.closeModal();
  }
}
