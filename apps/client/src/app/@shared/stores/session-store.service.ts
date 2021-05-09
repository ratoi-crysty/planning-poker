import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserSessionModel } from '@planning-poker/api-interfaces';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SessionStoreService {
  protected static readonly sessionKey = 'user:session';

  protected readonly token$ = new BehaviorSubject<string | undefined>(this.getStoredUserSession());

  getSessionValue(): UserSessionModel | undefined {
    const token: string | undefined = this.token$.getValue();

    return token ? this.parseJwt(token) : undefined;
  }

  getSession(): Observable<UserSessionModel | undefined> {
    return this.token$
      .pipe(
        map((token: string | undefined): UserSessionModel | undefined => token ? this.parseJwt(token) : undefined),
      );
  }

  getTokenValue(): string | undefined {
    return this.token$.getValue();
  }

  getToken(): Observable<string | undefined> {
    return this.token$.asObservable();
  }

  clearToken(): void {
    this.token$.next(undefined);
    this.clearStoredUserSession();
  }

  setToken(token: string): void {
    this.setStoredUserSession(token);
    this.token$.next(token);
  }

  protected parseJwt(token: string): UserSessionModel {
    const base64Url: string = token.split('.')[1];
    const base64: string = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload: string = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  protected getStoredUserSession(): string | undefined {
    return localStorage.getItem(SessionStoreService.sessionKey) || undefined;
  }

  protected setStoredUserSession(token: string): void {
    localStorage.setItem(SessionStoreService.sessionKey, token);
  }

  protected clearStoredUserSession(): void {
    localStorage.removeItem(SessionStoreService.sessionKey);
  }
}
