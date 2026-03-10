import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OccupancyData, OccupancyTrend, RoomUtilization, DashboardStats, ActivityItem } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private readonly apiUrl = '/api/analytics';

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
    }

    getOccupancyByHostel(): Observable<OccupancyData[]> {
        return this.http.get<OccupancyData[]>(`${this.apiUrl}/occupancy`);
    }

    getOccupancyTrend(hostelId?: string): Observable<OccupancyTrend[]> {
        let params = new HttpParams();
        if (hostelId) params = params.set('hostelId', hostelId);
        return this.http.get<OccupancyTrend[]>(`${this.apiUrl}/occupancy/trend`, { params });
    }

    getRoomUtilization(): Observable<RoomUtilization[]> {
        return this.http.get<RoomUtilization[]>(`${this.apiUrl}/rooms/utilization`);
    }

    getRecentActivity(): Observable<ActivityItem[]> {
        return this.http.get<ActivityItem[]>(`${this.apiUrl}/activity`);
    }
}
