import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MaintenanceRequest, MaintenanceResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private readonly apiUrl = '/api/maintenance';

    constructor(private http: HttpClient) { }

    getAll(params?: { status?: string; priority?: string; hostelId?: string }): Observable<MaintenanceResponse[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.priority) httpParams = httpParams.set('priority', params.priority);
        if (params?.hostelId) httpParams = httpParams.set('hostelId', params.hostelId);
        return this.http.get<MaintenanceResponse[]>(this.apiUrl, { params: httpParams });
    }

    getById(id: string): Observable<MaintenanceResponse> {
        return this.http.get<MaintenanceResponse>(`${this.apiUrl}/${id}`);
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

    updateStatus(id: string, status: string): Observable<MaintenanceResponse> {
        return this.http.patch<MaintenanceResponse>(`${this.apiUrl}/${id}/status`, { status });
    }
}
