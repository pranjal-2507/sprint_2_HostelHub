import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visitor } from '../models';

@Injectable({ providedIn: 'root' })
export class VisitorService {
    private readonly apiUrl = '/api/visitors';

    constructor(private http: HttpClient) { }

    getAll(params?: { hostelId?: string; status?: string }): Observable<Visitor[]> {
        return this.http.get<Visitor[]>(this.apiUrl, { params: params as any });
    }

    getById(id: string): Observable<Visitor> {
        return this.http.get<Visitor>(`${this.apiUrl}/${id}`);
    }

    create(visitor: Partial<Visitor>): Observable<Visitor> {
        return this.http.post<Visitor>(this.apiUrl, visitor);
    }

    update(id: string, visitor: Partial<Visitor>): Observable<Visitor> {
        return this.http.put<Visitor>(`${this.apiUrl}/${id}`, visitor);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    checkIn(visitor: Partial<Visitor>): Observable<Visitor> {
        return this.http.post<Visitor>(`${this.apiUrl}/checkin`, visitor);
    }

    checkOut(id: string): Observable<Visitor> {
        return this.http.post<Visitor>(`${this.apiUrl}/${id}/checkout`, {});
    }

    getTodayCheckIns(): Observable<Visitor[]> {
        return this.http.get<Visitor[]>(`${this.apiUrl}/today`);
    }
}
