import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { AuthService } from '../../auth/services/auth.service';

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
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, StatusBadgePipe],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      @if (loading) {
        <div class="loading-state">
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
          <!-- Recent Activity Placeholder -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">history</mat-icon>
              Dashboard Overview
            </h2>
            <div class="empty-placeholder">
              <mat-icon>dashboard_customize</mat-icon>
              <p>Quick overview of hostel operations. Use the sidebar to manage specific sections.</p>
            </div>
          </mat-card>

          <!-- System Status -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">security</mat-icon>
              System Status
            </h2>
            <div class="status-list">
              <div class="status-item">
                <span class="status-dot online"></span>
                <span>API Server Online</span>
              </div>
              <div class="status-item">
                <span class="status-dot online"></span>
                <span>Database Connected</span>
              </div>
              <div class="status-item">
                <span class="status-dot online"></span>
                <span>Authentication Service Ready</span>
              </div>
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
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .stat-card { padding: 24px; border-radius: 16px !important; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease; background: var(--card-bg) !important; border: 1px solid var(--border-color); }
    .stat-card:hover { transform: translateY(-4px); }
    .stat-icon { width: 54px; height: 54px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 28px; width: 28px; height: 28px; } }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
    .content-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section-card { border-radius: 20px !important; padding: 24px !important; background: var(--card-bg) !important; border: 1px solid var(--border-color); }
    .section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
    .section-icon { font-size: 22px; color: #4f46e5; }
    .empty-placeholder { text-align: center; padding: 40px 20px; color: var(--text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; } p { font-size: 14px; margin-top: 8px; } }
    .status-list { display: flex; flex-direction: column; gap: 16px; }
    .status-item { display: flex; align-items: center; gap: 12px; font-size: 14px; color: var(--text-main); }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.online { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) { .content-row { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  loading = true;
  statCards = [
    { title: 'Total Students', value: 0, icon: 'school', color: '#4f46e5', bg: '#eef2ff', key: 'total_students' },
    { title: 'Total Rooms', value: 0, icon: 'meeting_room', color: '#0891b2', bg: '#ecfeff', key: 'total_rooms' },
    { title: 'Occupied Rooms', value: 0, icon: 'door_front', color: '#059669', bg: '#ecfdf5', key: 'occupied_rooms' },
    { title: 'Vacant Rooms', value: 0, icon: 'door_back', color: '#6366f1', bg: '#f5f3ff', key: 'vacant_rooms' },
    { title: 'Pending Payments', value: 0, icon: 'pending_actions', color: '#d97706', bg: '#fffbeb', key: 'pending_payments' },
    { title: 'Active Complaints', value: 0, icon: 'report_problem', color: '#dc2626', bg: '#fef2f2', key: 'active_complaints' },
  ];

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.authService.getAdminDashboardData().subscribe({
      next: (stats: DashboardStats) => {
        this.statCards = this.statCards.map(card => ({
          ...card,
          value: (stats as any)[card.key] || 0
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching dashboard data', err);
        this.loading = false;
      }
    });
  }
}
