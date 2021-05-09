import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CreateRoomComponent } from './pages/create-room/create-room.component';
import { RoomPageComponent } from './pages/room-page/room-page.component';

const routes: Route[] = [
  { path: ':room', component: RoomPageComponent },
  { path: '', component: CreateRoomComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomRouterModule {

}
