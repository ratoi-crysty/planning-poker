import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { Observable } from 'rxjs';
import { RoomModel, UserSessionModel } from '@planning-poker/api-interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { SessionStoreService } from '../../../@shared/stores/session-store.service';
import { uniq } from 'lodash';

@Component({
  selector: 'planning-poker-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPageComponent {
  room$: Observable<RoomModel | undefined>;
  uniqUsers$: Observable<string[]>;
  user: UserSessionModel;
  cards: number[] = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, -1];

  votedCard: number | undefined;

  constructor(protected roomService: RoomService,
              protected sessionStore: SessionStoreService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected detectorRef: ChangeDetectorRef) {
    this.room$ = this.route.params
      .pipe(
        map((params: Params): string => {
          return params.room;
        }),
        distinctUntilChanged(),
        switchMap((id: string): Observable<RoomModel | undefined> => {
          return this.roomService.joinRoom(id);
        }),
        tap((room: RoomModel | undefined) => {
          if (room) {
            return;
          }

          this.router.navigate(['/'])
            .catch(console.error);
        }),
      );

    this.uniqUsers$ = this.room$
      .pipe(
        filter((room: RoomModel | undefined): room is RoomModel => !!room),
        map((room: RoomModel): string[] => {
          return uniq(room.usersList);
        }),
      );

    this.roomService.getVoted()
      .subscribe((voted: number | undefined) => {
        this.votedCard = voted;
        this.detectorRef.detectChanges();
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.user = this.sessionStore.getSessionValue()!;
  }

  vote(card: number, room: RoomModel) {
    const newCard: number | undefined = this.votedCard === card && room.voted[this.user.id] ? undefined : card;
    this.votedCard = newCard;

    this.roomService.vote(newCard)
      .subscribe(() => {
        // eslint-disable-next-line no-restricted-syntax
        console.info('Voted');
      });
  }

  show() {
    this.roomService.show()
      .subscribe(() => {
        // eslint-disable-next-line no-restricted-syntax
        console.info('Show');
      });
  }

  reset() {
    this.roomService.reset()
      .subscribe(() => {
        // eslint-disable-next-line no-restricted-syntax
        console.info('Reset');
      });
  }

  usersWithVote(room: RoomModel): string[] {
    return room.usersList
      .filter((id: string) => room.voted[id]);
  }

  isSelected(card: number, room: RoomModel): boolean {
    return card === this.votedCard && room.voted[this.user.id];
  }

  isOwner(room: RoomModel): boolean {
    return room.owner === this.user.id;
  }
}
