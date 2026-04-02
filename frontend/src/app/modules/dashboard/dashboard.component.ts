import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';

interface DashboardStats {
  total_students: number;
  total_rooms: number;
  occupied_rooms: number;
  vacant_rooms: number;
  pending_payments: number;
  active_complaints: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, NgxChartsModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      @if (loading) {
        <div class="loading-state">
          <mat-icon class="loading-icon">sync</mat-icon>
          <p>Loading dashboard data...</p>
        </div>
      } @else {
        <div class="stats-grid">
          @for (card of statCards; track card.title) {
            <div class="stat-card glass-card">
              <div class="stat-icon" [style.background]="card.bg">
                <mat-icon [style.color]="card.color">{{ card.icon }}</mat-icon>
              </div>
              <div class="stat-body">
                <span class="stat-value">{{ card.value }}</span>
                <span class="stat-label">{{ card.title }}</span>
              </div>
            </div>
          }
        </div>

        <div class="content-row">
          <!-- Room Occupancy Chart -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">pie_chart</mat-icon>
              Room Occupancy
            </h2>
            <div class="chart-container">
              <ngx-charts-pie-chart
                [results]="roomData"
                [scheme]="colorScheme"
                [doughnut]="true"
                [arcWidth]="0.35"
                [labels]="true"
                [legend]="true"
                [legendPosition]="legendPosition"
                [animations]="true">
              </ngx-charts-pie-chart>
            </div>
          </mat-card>

          <!-- Operations Overview Chart -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">bar_chart</mat-icon>
              Operations Overview
            </h2>
            <div class="chart-container">
              <ngx-charts-bar-vertical
                [results]="operationsData"
                [scheme]="colorScheme"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="false"
                [showYAxisLabel]="false"
                [animations]="true">
              </ngx-charts-bar-vertical>
            </div>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s ease-out; max-width: 1200px; padding: 0 16px; }
    .page-header { margin-bottom: 8px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }
    .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
    .loading-state { 
      text-align: center; 
      padding: 60px 40px; 
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .loading-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      animation: spin 2s linear infinite;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .stat-card { padding: 24px; border-radius: 16px !important; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease; background: var(--card-bg) !important; border: 1px solid var(--border-color); }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-icon { width: 54px; height: 54px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 28px; width: 28px; height: 28px; } }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
    .content-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section-card { border-radius: 20px !important; padding: 24px 24px 40px !important; background: var(--card-bg) !important; border: 1px solid var(--border-color); min-height: 460px; }
    .section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
    .section-icon { font-size: 22px; color: #4f46e5; }
    .empty-placeholder { text-align: center; padding: 40px 20px; color: var(--text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; } p { font-size: 14px; margin-top: 8px; } }
    .status-list { display: flex; flex-direction: column; gap: 16px; }
    .status-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-main); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.online { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
    .chart-container { height: 340px; width: 100%; display: flex; justify-content: center; padding-bottom: 40px; }
    ::ng-deep .ngx-charts { color: var(--text-main) !important; font-family: inherit !important; }
    ::ng-deep .ngx-charts text { fill: var(--text-muted) !important; font-weight: 500; font-size: 11px; }
    ::ng-deep .chart-legend { width: 140px !important; float: right !important; }
    ::ng-deep .chart-legend > div { width: auto !important; max-width: none !important; }
    ::ng-deep .legend-labels-list { background: transparent !important; width: auto !important; max-width: none !important; display: flex !important; flex-direction: column !important; gap: 8px !important; }
    ::ng-deep .legend-label { width: auto !important; margin-right: 0 !important; }
    ::ng-deep .legend-label-text { color: var(--text-main) !important; font-size: 12px !important; white-space: nowrap !important; overflow: visible !important; text-overflow: clip !important; width: auto !important; max-width: none !important; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) { .content-row { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  loading = true;
  statCards = [
    { title: 'Total Students', value: 0, icon: 'school', color: '#4f46e5', bg: '#eef2ff', key: 'total_students' },
    { title: 'Total Rooms', value: 0, icon: 'meeting_room', color: '#0891b2', bg: '#ecfeff', key: 'total_rooms' },
    { title: 'Occupied Rooms', value: 0, icon: 'door_front', color: '#059669', bg: '#ecfdf5', key: 'occupied_rooms' },
    { title: 'Vacant Rooms', value: 0, icon: 'door_back', color: '#6366f1', bg: '#f5f3ff', key: 'vacant_rooms' },
    { title: 'Pending Payments', value: 0, icon: 'pending_actions', color: '#d97706', bg: '#fffbeb', key: 'pending_payments' },
    { title: 'Active Complaints', value: 0, icon: 'report_problem', color: '#dc2626', bg: '#fef2f2', key: 'active_complaints' },
  ];

  roomData: any[] = [];
  operationsData: any[] = [];
  legendPosition = LegendPosition.Right;
  
  colorScheme: Color = {
    name: 'hostelTheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#818cf8']
  };

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.authService.getAdminDashboardData().subscribe({
      next: (stats: DashboardStats) => {
        console.log('Dashboard data received:', stats);
        this.statCards = this.statCards.map(card => ({
          ...card,
          value: (stats as any)[card.key] || 0
        }));

        this.roomData = [
          { name: 'Occupied', value: stats.occupied_rooms },
          { name: 'Vacant', value: stats.vacant_rooms }
        ];

        this.operationsData = [
          { name: 'Students', value: stats.total_students },
          { name: 'Payments', value: stats.pending_payments },
          { name: 'Complaints', value: stats.active_complaints }
        ];

        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err: any) => {
        console.error('Error fetching dashboard data', err);
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update even on error
      }
    });
  }
}
