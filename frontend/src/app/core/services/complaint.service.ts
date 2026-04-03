import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Complaint } from '../models';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
    private readonly apiUrl = '/api/complaints';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Complaint[]> {
        return this.http.get<Complaint[]>('/api/admin/complaints');
    }

    getHostelerComplaints(): Observable<Complaint[]> {
        return this.http.get<Complaint[]>('/api/hosteler/complaints');
    }

    createComplaint(complaint: Partial<Complaint>): Observable<Complaint> {
        return this.http.post<Complaint>('/api/hosteler/complaints', complaint);
    }

    updateComplaint(id: string, complaint: Partial<Complaint>): Observable<any> {
        return this.http.put<any>(`/api/hosteler/complaints/${id}`, complaint);
    }

    deleteComplaint(id: string): Observable<any> {
        return this.http.delete<any>(`/api/hosteler/complaints/${id}`);
    }

    updateStatus(id: string, status: string): Observable<any> {
        return this.http.put<any>(`/api/admin/complaints/${id}`, { status });
    }
}
