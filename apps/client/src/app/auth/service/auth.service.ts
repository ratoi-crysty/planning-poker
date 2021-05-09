import { Injectable } from '@angular/core';
import { ApiService } from '../../@shared/api/api.service';
import { Observable } from 'rxjs';
import { LoginRequest, UserSessionModel } from '@planning-poker/api-interfaces';
import { map, tap } from 'rxjs/operators';
import { SessionStoreService } from '../../@shared/stores/session-store.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(protected api: ApiService, protected sessionStore: SessionStoreService) { }

  login(name: string): Observable<UserSessionModel> {
    return this.api.post<{ accessToken: string }>('auth/login', <LoginRequest>{
      name,
    })
      .pipe(
        tap(({ accessToken }) => this.sessionStore.setToken(accessToken)),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(() => this.sessionStore.getSessionValue()!),
      );
  }
}
