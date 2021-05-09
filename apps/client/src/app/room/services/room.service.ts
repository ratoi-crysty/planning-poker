import { Injectable } from '@angular/core';
import { ApiService } from '../../@shared/api/api.service';
import { merge, Observable } from 'rxjs';
import { RoomModel } from '@planning-poker/api-interfaces';
import { map, mergeAll } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(protected api: ApiService) {
  }

  joinRoom(id: string): Observable<RoomModel | undefined> {
    return merge([
      this.api.listenToEvent<RoomModel | null>('updated'),
      this.api.sendEvent<undefined, { id: string }>('join', { id }),
    ])
      .pipe(
        mergeAll(),
        map((room: RoomModel | undefined | null): RoomModel | undefined => room || undefined),
      )
  }

  createRoom(): Observable<RoomModel> {
    return this.api.sendEvent<RoomModel>('create');
  }

  vote(vote: number | undefined): Observable<void> {
    return this.api.sendEvent<void, number>('vote', vote);
  }

  getVoted(): Observable<number | undefined> {
    return this.api.sendEvent<number | undefined>('get-voted');
  }

  show(): Observable<void> {
    return this.api.sendEvent<void>('show');
  }

  reset(): Observable<void> {
    return this.api.sendEvent<void>('reset');
  }
}
