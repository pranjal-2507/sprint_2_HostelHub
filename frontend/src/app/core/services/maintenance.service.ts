import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaintenanceRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private readonly apiUrl = '/api/maintenance';

    constructor(private http: HttpClient) { }

    getAll(params?: { status?: string; priority?: string; hostelId?: string }): Observable<MaintenanceRequest[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.priority) httpParams = httpParams.set('priority', params.priority);
        if (params?.hostelId) httpParams = httpParams.set('hostelId', params.hostelId);
        return this.http.get<MaintenanceRequest[]>(this.apiUrl, { params: httpParams });
    }

    getById(id: string): Observable<MaintenanceRequest> {
        return this.http.get<MaintenanceRequest>(`${this.apiUrl}/${id}`);
    }

    create(request: Partial<MaintenanceRequest>): Observable<MaintenanceRequest> {
        return this.http.post<MaintenanceRequest>(`${this.apiUrl}/request`, request);
    }

    update(id: string, request: Partial<MaintenanceRequest>): Observable<MaintenanceRequest> {
        return this.http.put<MaintenanceRequest>(`${this.apiUrl}/${id}`, request);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    updateStatus(id: string, status: string): Observable<MaintenanceRequest> {
        return this.http.patch<MaintenanceRequest>(`${this.apiUrl}/${id}/status`, { status });
    }
}
