
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { StatusBadgePipe } from '../../shared/pipes/status-badge.pipe';
import { AuthService } from '../../auth/services/auth.service';

interface AdminDashboardData {
  stats: {
    total_students: number;
    total_rooms: number;
    occupied_rooms: number;
    vacant_rooms: number;
    pending_payments: number;
    active_complaints: number;
  };
  recent_students: any[];
  recent_payments: any[];
  recent_complaints: any[];
}
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
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, StatusBadgePipe],
  template: `
    <div class="dashboard-container">
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
          <!-- Recent Students -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">school</mat-icon>
              Recent Students
            </h2>
            <table mat-table [dataSource]="recentStudents" class="section-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let s"><strong>{{ s.name }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="room">
                <th mat-header-cell *matHeaderCellDef>Room</th>
                <td mat-cell *matCellDef="let s">{{ s.room }}</td>
              </ng-container>
              <ng-container matColumnDef="course">
                <th mat-header-cell *matHeaderCellDef>Course</th>
                <td mat-cell *matCellDef="let s">{{ s.course }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Joined</th>
                <td mat-cell *matCellDef="let s">{{ s.date }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['name','room','course','date']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name','room','course','date'];"></tr>
            </table>
          </mat-card>

          <!-- Recent Payments -->
          <mat-card class="section-card glass-card">
            <h2 class="section-title">
              <mat-icon class="section-icon">payments</mat-icon>
              Recent Payments
            </h2>
            <table mat-table [dataSource]="recentPayments" class="section-table">
              <ng-container matColumnDef="student">
                <th mat-header-cell *matHeaderCellDef>Student</th>
                <td mat-cell *matCellDef="let p"><strong>{{ p.student }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef>Amount</th>
                <td mat-cell *matCellDef="let p">₹{{ p.amount | number }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.date }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let p">
                  <span class="badge" [ngClass]="p.status | statusBadge">{{ p.status | titlecase }}</span>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['student','amount','date','status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['student','amount','date','status'];"></tr>
            </table>
          </mat-card>
        </div>

        <!-- Latest Complaints -->
        <mat-card class="section-card glass-card">
          <h2 class="section-title">
            <mat-icon class="section-icon">report_problem</mat-icon>
            Latest Complaints
          </h2>
          <table mat-table [dataSource]="latestComplaints" class="section-table">
            <ng-container matColumnDef="student">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let c"><strong>{{ c.student }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="room">
              <th mat-header-cell *matHeaderCellDef>Room</th>
              <td mat-cell *matCellDef="let c">{{ c.room }}</td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Issue</th>
              <td mat-cell *matCellDef="let c">{{ c.title }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="badge" [ngClass]="c.status | statusBadge">{{ c.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let c">{{ c.date }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['student','room','title','status','date']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['student','room','title','status','date'];"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s ease-out; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
    .stat-card { padding: 24px; border-radius: 16px !important; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease; &:hover { transform: translateY(-4px); } }
    .stat-icon { width: 54px; height: 54px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 28px; width: 28px; height: 28px; } }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
    .content-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section-card { border-radius: 20px !important; padding: 24px !important; background: var(--card-bg) !important; }
    .section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
    .section-icon { font-size: 22px; width: 22px; height: 22px; color: #4f46e5; }
    .section-table { width: 100%; background: transparent !important; }
    strong { color: var(--text-main); }
    .badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1024px) { .content-row { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  statCards = [
    { title: 'Total Students', value: 0, icon: 'school', color: '#4f46e5', bg: '#eef2ff', key: 'total_students' },
    { title: 'Total Rooms', value: 0, icon: 'meeting_room', color: '#0891b2', bg: '#ecfeff', key: 'total_rooms' },
    { title: 'Occupied Rooms', value: 0, icon: 'door_front', color: '#059669', bg: '#ecfdf5', key: 'occupied_rooms' },
    { title: 'Vacant Rooms', value: 0, icon: 'door_back', color: '#6366f1', bg: '#f5f3ff', key: 'vacant_rooms' },
    { title: 'Pending Payments', value: 0, icon: 'pending_actions', color: '#d97706', bg: '#fffbeb', key: 'pending_payments' },
    { title: 'Active Complaints', value: 0, icon: 'report_problem', color: '#dc2626', bg: '#fef2f2', key: 'active_complaints' },
  ];

  recentStudents: any[] = [];
  recentPayments: any[] = [];
  latestComplaints: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.authService.getAdminDashboardData().subscribe({
      next: (data: AdminDashboardData) => {
        const stats = data.stats;
        this.statCards = this.statCards.map(card => ({
          ...card,
          value: (stats as any)[card.key] || 0
        }));
        
        this.recentStudents = data.recent_students.map((s: any) => ({
          name: s.name,
          room: s.room_number || 'N/A',
          course: s.course || 'N/A',
          date: new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));

        this.recentPayments = data.recent_payments.map((p: any) => ({
          student: p.student_name,
          amount: p.amount,
          date: new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: p.status
        }));

        this.latestComplaints = data.recent_complaints.map((c: any) => ({
          student: c.student_name,
          room: c.room_number || 'N/A',
          title: c.title,
          status: c.status,
          date: new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));
        
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching dashboard data', err);
        this.loading = false;
      }
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
