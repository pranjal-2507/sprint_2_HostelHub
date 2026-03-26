import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardStats, ActivityItem } from '../../core/models';
import { HostelService, RoomService, MaintenanceService } from '../../core/services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, NgxChartsModule],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>

      <div class="stats-grid">
        @for (card of statCards; track card.title) {
          <div class="stat-card">
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
        <mat-card class="chart-card">
          <h2 class="section-title">Occupancy Overview</h2>
          <ngx-charts-bar-vertical
            [results]="occupancyChartData"
            [xAxis]="true" [yAxis]="true"
            [showXAxisLabel]="true" [showYAxisLabel]="true"
            [xAxisLabel]="'Hostel'" [yAxisLabel]="'Occupancy %'"
            [gradient]="false"
            [scheme]="colorScheme"
            [roundDomains]="true"
            [view]="[550, 300]">
          </ngx-charts-bar-vertical>
        </mat-card>

        <mat-card class="activity-card">
          <h2 class="section-title">Recent Activity</h2>
          <div class="activity-list">
            @for (item of recentActivity; track item.id) {
              <div class="activity-item">
                <mat-icon class="activity-icon" [style.color]="item.iconColor">{{ item.icon }}</mat-icon>
                <div class="activity-body">
                  <span class="activity-title">{{ item.title }}</span>
                  <span class="activity-desc">{{ item.description }}</span>
                </div>
                <span class="activity-time">{{ item.timestamp }}</span>
              </div>
            }
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0 0 24px; }
    .stats-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 14px;
      border: 1px solid #f1f5f9;
    }
    .stat-icon {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 12px; color: #94a3b8; }
    .content-row { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }
    .chart-card, .activity-card {
      background: #fff !important; border: 1px solid #f1f5f9;
      border-radius: 12px !important; padding: 20px !important;
    }
    .section-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
    .activity-list { display: flex; flex-direction: column; }
    .activity-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid #f8f9fb;
      &:last-child { border-bottom: none; }
    }
    .activity-icon { font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .activity-body { flex: 1; display: flex; flex-direction: column; }
    .activity-title { font-size: 13px; font-weight: 500; color: #334155; }
    .activity-desc { font-size: 12px; color: #94a3b8; }
    .activity-time { font-size: 11px; color: #94a3b8; white-space: nowrap; }
    @media (max-width: 900px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .content-row { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  statCards: any[] = [];
  occupancyChartData: any[] = [];
  colorScheme: any = { domain: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'] };
  recentActivity: (ActivityItem & { iconColor: string })[] = [];

  constructor(
    private hostelService: HostelService,
    private roomService: RoomService,
    private maintenanceService: MaintenanceService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    forkJoin({
      hostels: this.hostelService.getAll(),
      rooms: this.roomService.getAll(),
      maintenance: this.maintenanceService.getAll(),
    }).subscribe({
      next: (data) => {
        this.updateStats(data);
        this.updateChart(data.hostels, data.rooms);
        // Activity would typically come from a dedicated activity service/endpoint
        // For now, we'll keep the mock activity or map it from recent records
      },
      error: (err) => console.error('Error loading dashboard data', err)
    });
  }

  private updateStats(data: { hostels: any[], rooms: any[], maintenance: any[] }): void {
    const availableRooms = data.rooms.filter(r => r.status === 'available').length;
    
    this.statCards = [
      { title: 'Total Hostels', value: data.hostels.length, icon: 'apartment', color: '#4f46e5', bg: '#eef2ff' },
      { title: 'Available Rooms', value: availableRooms, icon: 'meeting_room', color: '#0891b2', bg: '#ecfeff' },
      { title: 'Maintenance', value: data.maintenance.length, icon: 'build', color: '#d97706', bg: '#fffbeb' },
      { title: 'Visitors Today', value: 0, icon: 'people', color: '#059669', bg: '#ecfdf5' },
    ];
  }

  private updateChart(hostels: any[], rooms: any[]): void {
    this.occupancyChartData = hostels.map(h => {
      const hostelRooms = rooms.filter(r => r.hostelId === h.id);
      const totalCapacity = hostelRooms.reduce((acc, r) => acc + r.capacity, 0);
      const currentOccupancy = hostelRooms.reduce((acc, r) => acc + r.occupancy, 0);
      const percentage = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;
      
      return { name: h.name, value: percentage };
    });
  }
}
