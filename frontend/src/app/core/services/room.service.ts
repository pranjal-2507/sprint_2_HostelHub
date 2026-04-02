import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomAllocation } from '../models';

@Injectable({ providedIn: 'root' })
export class RoomService {
    private readonly apiUrl = '/api/rooms';

    constructor(private http: HttpClient) { }

    getAll(params?: { hostelId?: string; status?: string; type?: string }): Observable<Room[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        if (params?.hostelId) httpParams = httpParams.set('hostel_id', params.hostelId);
        
        return this.http.get<Room[]>('/api/admin/rooms', { params: httpParams });
    }

    getById(id: string): Observable<Room> {
        return this.http.get<Room>(`/api/admin/rooms/${id}`);
    }

    create(room: Partial<Room>): Observable<Room> {
        return this.http.post<Room>('/api/admin/rooms', room);
    }

    update(id: string, room: Partial<Room>): Observable<Room> {
        return this.http.put<Room>(`/api/admin/rooms/${id}`, room);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/rooms/${id}`);
    }

    getHostelerRoomInfo(): Observable<Room> {
        return this.http.get<Room>('/api/hosteler/room-info');
    }

    allocate(allocation: RoomAllocation): Observable<Room> {
        return this.http.post<Room>(`/api/admin/students/${allocation.studentId}/assign-room/${allocation.roomNumber}`, {});
    }

    deallocate(roomId: string, studentId: string): Observable<Room> {
        return this.http.delete<Room>(`/api/admin/students/${studentId}`);
    }
}
