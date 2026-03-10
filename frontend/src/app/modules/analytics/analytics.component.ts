import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatSelectModule, MatFormFieldModule, NgxChartsModule],
  template: `
    <div class="analytics-page">
      <div class="page-header">
        <h1 class="page-title">Analytics</h1>
        <mat-form-field appearance="outline" class="period-field">
          <mat-label>Period</mat-label>
          <mat-select value="month">
            <mat-option value="week">Last 7 Days</mat-option>
            <mat-option value="month">Last 30 Days</mat-option>
            <mat-option value="year">Last Year</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="stats-grid">
        @for (s of summaryStats; track s.label) {
          <div class="stat-card">
            <div class="stat-icon" [style.background]="s.bg"><mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon></div>
            <div class="stat-body">
              <span class="stat-value">{{ s.value }}</span>
              <span class="stat-label">{{ s.label }}</span>
            </div>
          </div>
        }
      </div>

      <div class="charts-grid">
        <mat-card class="chart-card">
          <h2 class="section-title">Occupancy by Hostel</h2>
          <ngx-charts-bar-vertical [results]="occupancyByHostel" [xAxis]="true" [yAxis]="true"
            [gradient]="false" [scheme]="barScheme" [roundDomains]="true" [view]="[550, 300]">
          </ngx-charts-bar-vertical>
        </mat-card>
        <mat-card class="chart-card">
          <h2 class="section-title">Occupancy Trend</h2>
          <ngx-charts-line-chart [results]="occupancyTrend" [xAxis]="true" [yAxis]="true"
            [scheme]="lineScheme" [autoScale]="true" [view]="[550, 300]">
          </ngx-charts-line-chart>
        </mat-card>
        <mat-card class="chart-card">
          <h2 class="section-title">Room Utilization</h2>
          <ngx-charts-pie-chart [results]="roomUtilization" [scheme]="pieScheme"
            [labels]="true" [doughnut]="true" [arcWidth]="0.45" [view]="[550, 300]">
          </ngx-charts-pie-chart>
        </mat-card>
        <mat-card class="chart-card">
          <h2 class="section-title">Room Types</h2>
          <ngx-charts-bar-horizontal [results]="roomTypeData" [xAxis]="true" [yAxis]="true"
            [scheme]="barScheme" [gradient]="false" [view]="[550, 300]">
          </ngx-charts-bar-horizontal>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .analytics-page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
    .period-field { max-width: 160px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: #fff; border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 14px; border: 1px solid #f1f5f9;
    }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1e293b; }
    .stat-label { font-size: 12px; color: #94a3b8; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .chart-card {
      background: #fff !important; border: 1px solid #f1f5f9;
      border-radius: 12px !important; padding: 20px !important;
    }
    .section-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
    @media (max-width: 900px) {
      .charts-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export class AnalyticsComponent {
  summaryStats = [
    { label: 'Avg Occupancy', value: '78%', icon: 'hotel', color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Total Rooms', value: '240', icon: 'meeting_room', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Occupied', value: '187', icon: 'check_circle', color: '#059669', bg: '#ecfdf5' },
    { label: 'Available', value: '53', icon: 'event_available', color: '#d97706', bg: '#fffbeb' },
  ];

  barScheme: any = { domain: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'] };
  lineScheme: any = { domain: ['#4f46e5'] };
  pieScheme: any = { domain: ['#4f46e5', '#6366f1', '#d97706', '#dc2626'] };

  occupancyByHostel = [
    { name: 'Hostel A', value: 85 }, { name: 'Hostel B', value: 72 },
    { name: 'Hostel C', value: 91 }, { name: 'Hostel D', value: 64 },
    { name: 'Hostel E', value: 78 }, { name: 'Hostel F', value: 88 },
  ];
  occupancyTrend = [{
    name: 'Overall', series: [
      { name: 'Jan', value: 65 }, { name: 'Feb', value: 70 }, { name: 'Mar', value: 75 },
      { name: 'Apr', value: 72 }, { name: 'May', value: 78 }, { name: 'Jun', value: 82 },
      { name: 'Jul', value: 80 }, { name: 'Aug', value: 85 }, { name: 'Sep', value: 88 },
      { name: 'Oct', value: 83 }, { name: 'Nov', value: 79 }, { name: 'Dec', value: 78 },
    ]
  }];
  roomUtilization = [
    { name: 'Occupied', value: 187 }, { name: 'Available', value: 38 },
    { name: 'Maintenance', value: 8 }, { name: 'Reserved', value: 7 },
  ];
  roomTypeData = [
    { name: 'Single', value: 60 }, { name: 'Double', value: 90 },
    { name: 'Triple', value: 50 }, { name: 'Dormitory', value: 40 },
  ];
}
