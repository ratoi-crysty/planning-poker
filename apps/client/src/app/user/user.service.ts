import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from '@planning-poker/api-interfaces';
import { ApiService } from '../@shared/api/api.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  protected userSubject = new BehaviorSubject<UserModel | undefined>(undefined);

  constructor(protected api: ApiService) {
  }

  get user$(): Observable<UserModel | undefined> {
    return this.userSubject.asObservable();
  }

  getUserValue(): UserModel | undefined {
    return this.userSubject.getValue();
  }

  setUser(name: string): Observable<void> {
    return this.api.post<UserModel>('user', {
      name
    })
      .pipe(
        tap((user: UserModel): void => this.userSubject.next(user)),
        map(() => undefined)
      );
  }

  clearUser() {
    this.userSubject.next(undefined);
  }
}
