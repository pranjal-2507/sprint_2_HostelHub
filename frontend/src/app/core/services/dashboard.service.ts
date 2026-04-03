import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_students: number;
  total_rooms: number;
  occupied_rooms: number;
  vacant_rooms: number;
  pending_payments: number;
  active_complaints: number;
  overdue_payments: number;
  pending_maintenance: number;
  visitors_checked_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/admin/dashboard';

  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
