import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hostel } from '../models';

@Injectable({ providedIn: 'root' })
export class HostelService {
    private readonly apiUrl = '/api/hostels';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Hostel[]> {
        return this.http.get<Hostel[]>(this.apiUrl);
    }

    getById(id: string): Observable<Hostel> {
        return this.http.get<Hostel>(`${this.apiUrl}/${id}`);
    }

    create(hostel: Partial<Hostel>): Observable<Hostel> {
        return this.http.post<Hostel>(this.apiUrl, hostel);
    }

    update(id: string, hostel: Partial<Hostel>): Observable<Hostel> {
        return this.http.put<Hostel>(`${this.apiUrl}/${id}`, hostel);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
