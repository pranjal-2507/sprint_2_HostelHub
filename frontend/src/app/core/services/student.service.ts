import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentService {
    private readonly apiUrl = '/api/students';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Student[]> {
        return this.http.get<Student[]>('/api/admin/students');
    }

    getById(id: string): Observable<Student> {
        return this.http.get<Student>(`/api/admin/students/${id}`);
    }

    create(student: Partial<Student>): Observable<Student> {
        return this.http.post<Student>('/api/admin/students', student);
    }

    update(id: string, student: Partial<Student>): Observable<Student> {
        return this.http.put<Student>(`/api/admin/students/${id}`, student);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/students/${id}`);
    }

    assignRoom(studentId: string, roomNumber: string): Observable<any> {
        return this.http.put<any>(`/api/admin/students/${studentId}/assign-room/${roomNumber}`, {});
    }

    removeFromRoom(studentId: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/students/${studentId}`);
    }

    getFees(studentId: string): Observable<any[]> {
        return this.http.get<any[]>(`/api/admin/students/${studentId}/fees`);
    }

    getComplaints(studentId: string): Observable<any[]> {
        return this.http.get<any[]>(`/api/admin/students/${studentId}/complaints`);
    }
}
