import { Component, Input } from '@angular/core';
import { getParsedCard } from '../../utils/card.utils';

@Component({
  selector: 'planning-poker-voted-card',
  templateUrl: './voted-card.component.html',
  styleUrls: ['./voted-card.component.scss'],
})
export class VotedCardComponent {
  @Input() name!: string;
  @Input() card?: number;

  get cardContent(): string | undefined {
    return this.card !== undefined ? getParsedCard(this.card) : undefined;
  }
}
