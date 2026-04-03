import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notice } from '../models';

@Injectable({ providedIn: 'root' })
export class NoticeService {
    constructor(private http: HttpClient) { }

    getAllNotices(): Observable<Notice[]> {
        return this.http.get<Notice[]>('/api/notices');
    }

    createNotice(notice: Partial<Notice>): Observable<Notice> {
        return this.http.post<Notice>('/api/admin/notices', notice);
    }

    updateNotice(id: string, notice: Partial<Notice>): Observable<Notice> {
        return this.http.put<Notice>(`/api/admin/notices/${id}`, notice);
    }

    deleteNotice(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/notices/${id}`);
    }
}
