export type Outcome = 'win' | 'lose' | 'push';
export type Button = HTMLButtonElement | null;
export type DOMElement =
  | HTMLDivElement
  | HTMLSpanElement
  | HTMLHeadingElement
  | HTMLParagraphElement
  | null;
export interface Buttons {
  hit: Button;
  stand: Button;
  split: Button;
  deal: Button;
  suggest: Button;
  reset: Button;
}
export interface DOMElements {
  playerHand: DOMElement;
  dealerHand: DOMElement;
  feedback: DOMElement;
}
