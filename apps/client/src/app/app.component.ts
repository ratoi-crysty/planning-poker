import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionStoreService } from './@shared/stores/session-store.service';

@Component({
  selector: 'planning-poker-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  name = '';
  token$: Observable<string | undefined>;

  constructor(protected sessionStore: SessionStoreService) {
    this.token$ = this.sessionStore.getToken();
  }
}
