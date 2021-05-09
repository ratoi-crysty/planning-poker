import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { getParsedCard } from '../../utils/card.utils';

@Component({
  selector: 'planning-poker-vote-card',
  templateUrl: './vote-card.component.html',
  styleUrls: ['./vote-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteCardComponent {
  @Input() card!: number;
  @Input() selected?: boolean;
  @Input() disabled?: boolean;

  @Output() vote = new EventEmitter<number>();

  handleVote() {
    if (this.disabled) {
      return;
    }

    this.vote.emit(this.card);
  }

  get cardValue(): string {
    return getParsedCard(this.card);
  }
}
