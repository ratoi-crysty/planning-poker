import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'planning-poker-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  @Input() name!: string;
  @Input() voted?: boolean;
}
