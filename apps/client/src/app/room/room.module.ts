import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomPageComponent } from './pages/room-page/room-page.component';
import { CreateRoomComponent } from './pages/create-room/create-room.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RoomRouterModule } from './room-router.module';
import { NbButtonModule, NbCardModule, NbUserModule } from '@nebular/theme';
import { VotedCardComponent } from './components/voted-card/voted-card.component';
import { VoteCardComponent } from './components/vote-card/vote-card.component';
import { UserComponent } from './components/user/user.component';

@NgModule({
  declarations: [RoomPageComponent, CreateRoomComponent, VotedCardComponent, VoteCardComponent, UserComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RoomRouterModule,
    NbCardModule,
    NbButtonModule,
    NbUserModule,
  ],
})
export class RoomModule {
}
