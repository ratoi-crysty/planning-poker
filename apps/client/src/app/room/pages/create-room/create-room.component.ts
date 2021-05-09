import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { RoomModel } from '@planning-poker/api-interfaces';

@Component({
  selector: 'planning-poker-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRoomComponent {
  constructor(protected router: Router, protected roomService: RoomService) {

  }

  createRoom() {
    this.roomService.createRoom()
      .subscribe((room: RoomModel) => {
        console.log('Room created', room.id);
        this.router.navigate([room.id])
          .catch(console.error);
      });
  }
}
