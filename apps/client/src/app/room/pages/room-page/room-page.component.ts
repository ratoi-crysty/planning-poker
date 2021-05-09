import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { Observable } from 'rxjs';
import { RoomModel, UserSessionModel } from '@planning-poker/api-interfaces';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { SessionStoreService } from '../../../@shared/stores/session-store.service';

@Component({
  selector: 'planning-poker-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPageComponent {
  room$: Observable<RoomModel | undefined>;
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
          console.log('Join room', id);
          return this.roomService.joinRoom(id);
        }),
        tap((room: RoomModel | undefined) => {
          if (room) {
            return;
          }

          console.log('Room was not found', room);
          this.router.navigate(['/'])
            .catch(console.error);
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
        console.log('Voted');
      });
  }

  show() {
    this.roomService.show()
      .subscribe(() => {
        console.log('Show');
      });
  }

  reset() {
    this.roomService.reset()
      .subscribe(() => {
        console.log('Reset');
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
