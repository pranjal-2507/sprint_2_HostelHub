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
        if (params?.hostelId) httpParams = httpParams.set('hostelId', params.hostelId);
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        return this.http.get<Room[]>(this.apiUrl, { params: httpParams });
    }

    getById(id: string): Observable<Room> {
        return this.http.get<Room>(`${this.apiUrl}/${id}`);
    }

    create(room: Partial<Room>): Observable<Room> {
        return this.http.post<Room>(this.apiUrl, room);
    }

    update(id: string, room: Partial<Room>): Observable<Room> {
        return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    allocate(allocation: RoomAllocation): Observable<Room> {
        return this.http.post<Room>(`${this.apiUrl}/allocate`, allocation);
    }

    deallocate(roomId: string, studentId: string): Observable<Room> {
        return this.http.post<Room>(`${this.apiUrl}/deallocate`, { roomId, studentId });
    }
}
