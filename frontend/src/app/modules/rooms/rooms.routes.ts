import { Routes } from '@angular/router';

export const roomsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./room-list/room-list.component').then((m) => m.RoomListComponent),
    },
];
