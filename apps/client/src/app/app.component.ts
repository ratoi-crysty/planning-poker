import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SessionStoreService } from './@shared/stores/session-store.service';
import { UserModel } from '@planning-poker/api-interfaces';
import { NbMenuBag, NbMenuItem, NbMenuService } from '@nebular/theme';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'planning-poker-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  name = '';
  user$: Observable<UserModel | undefined>;

  userMenu: NbMenuItem[] = [{ title: 'Logout', icon: 'power-outline' }];

  readonly menuTag = 'App:UsersMenu';

  constructor(protected sessionStore: SessionStoreService, protected nbMenu: NbMenuService) {
    this.user$ = this.sessionStore.getSession();
  }

  ngOnInit() {
    this.nbMenu.onItemClick()
      .pipe(
        filter(({ tag, item }: NbMenuBag) => tag === this.menuTag && item === this.userMenu[0]),
      )
      .subscribe(
        () => {
          this.logout();
        },
      );
  }

  protected logout() {
    this.sessionStore.clearToken();
  }
}
