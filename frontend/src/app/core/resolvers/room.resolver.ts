import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RoomService } from '../services/room.service';
import { catchError, of } from 'rxjs';

/** Pre-fetches room data before route activation for instant UI load */
export const roomResolver: ResolveFn<any> = (route, state) => {
    const roomService = inject(RoomService);
    return roomService.getHostelerRoomInfo().pipe(
        catchError(() => of(null))
    );
};
