export function getParsedCard(card: number): string {
  switch (card) {
    case -1:
      return '?'
    case -2:
      return '∞';
    default:
      return card.toString();
  }
}
