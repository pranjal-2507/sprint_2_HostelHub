import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fee, FeeResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class FeeService {
    private readonly apiUrl = '/api/fees';

    constructor(private http: HttpClient) { }

    getAll(): Observable<FeeResponse[]> {
        return this.http.get<FeeResponse[]>('/api/admin/fees');
    }

    getHostelerFees(): Observable<Fee[]> {
        return this.http.get<Fee[]>('/api/hosteler/fees');
    }

    create(fee: Partial<Fee>): Observable<Fee> {
        return this.http.post<Fee>('/api/admin/fees', fee);
    }

    updateStatus(id: string, status: string): Observable<any> {
        return this.http.put<any>(`/api/admin/fees/${id}/status/${status}`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/fees/${id}`);
    }
}
