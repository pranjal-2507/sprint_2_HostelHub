import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

interface HostelerDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    course?: string;
    year?: number;
    room_number?: string;
  };
    room_info?: {
    id: string;
    room_number: string;
    floor: number;
    capacity: number;
    occupancy: number;
    room_type: string;
    price_per_month: number;
    status: string;
  };
  fee_status: Array<{
    id: string;
    amount: number;
    fee_type: string;
    due_date: string;
    status: string;
    paid_at?: string;
    created_at: string;
  }>;
  recent_complaints: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
  }>;
  recent_notices: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    created_at: string;
  }>;
}

@Component({
  selector: 'app-hosteler-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, StatusBadgePipe],
  template: `
    <div class="dashboard-container">
      <div class="welcome-banner glass-card premium-gradient">
        <div class="welcome-text">
          <h1>Welcome back, {{ dashboardData?.user?.name || authService.currentUserValue?.name }} 👋</h1>
          <p>Here's what's happening with your stay at HostelHub.</p>
        </div>
        <div class="welcome-stats">
          <div class="mini-stat">
            <span class="label">Room</span>
            <span class="value">{{ dashboardData?.user?.room_number || 'TBD' }}</span>
          </div>
          <div class="mini-stat">
            <span class="label">Dues</span>
            <span class="value">₹{{ getTotalDues() | number }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card glass-card">
          <div class="card-icon room">
            <mat-icon>bed</mat-icon>
          </div>
          <div class="card-body">
            <span class="card-value">{{ dashboardData?.user?.room_number || 'Not Assigned' }}</span>
            <span class="card-label">Current Room</span>
          </div>
        </div>

        <div class="summary-card glass-card">
          <div class="card-icon fee">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="card-body">
            <span class="card-value">{{ getPendingFeesCount() }}</span>
            <span class="card-label">Pending Payments</span>
          </div>
        </div>

        <div class="summary-card glass-card">
          <div class="card-icon complaint">
            <mat-icon>report_problem</mat-icon>
          </div>
          <div class="card-body">
            <span class="card-value">{{ getActiveComplaintsCount() }}</span>
            <span class="card-label">Active Complaints</span>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Room Details -->
        <mat-card class="section-card glass-card room-section">
          <h2 class="section-title">
            <mat-icon class="section-icon">meeting_room</mat-icon>
            Room Information
          </h2>
          @if (dashboardData?.room_info) {
            <div class="room-info-box">
              <div class="info-row">
                <div class="info-col">
                  <span class="label">Floor</span>
                  <span class="val">{{ dashboardData?.room_info?.floor }}</span>
                </div>
                <div class="info-col">
                  <span class="label">Type</span>
                  <span class="val">{{ dashboardData?.room_info?.room_type }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-col">
                  <span class="label">Rent</span>
                  <span class="val">₹{{ dashboardData?.room_info?.price_per_month | number }}/mo</span>
                </div>
                <div class="info-col">
                  <span class="label">Status</span>
                  <span class="badge" [ngClass]="dashboardData?.room_info?.status">{{ dashboardData?.room_info?.status | titlecase }}</span>
                </div>
              </div>
            </div>
          } @else {
            <p class="empty-msg">No room assigned yet.</p>
          }
        </mat-card>

        <!-- Notices -->
        <mat-card class="section-card glass-card notices-section">
          <h2 class="section-title">
            <mat-icon class="section-icon">campaign</mat-icon>
            Latest Notices
          </h2>
          <div class="notices-scroll">
            @for (notice of dashboardData?.recent_notices; track notice.id) {
              <div class="notice-card">
                <div class="notice-header">
                  <h3>{{ notice.title }}</h3>
                  <span class="badge" [ngClass]="'priority-' + notice.priority">{{ notice.priority }}</span>
                </div>
                <p>{{ notice.content }}</p>
                <span class="date">{{ notice.created_at | date:'dd MMM, hh:mm a' }}</span>
              </div>
            } @empty {
              <p class="empty-msg">No new notices.</p>
            }
          </div>
        </mat-card>
      </div>

      <div class="tables-row">
        <!-- Payments Table -->
        <mat-card class="section-card glass-card full-width">
          <h2 class="section-title">
            <mat-icon class="section-icon">payments</mat-icon>
            Recent Payments
          </h2>
          <table mat-table [dataSource]="dashboardData?.fee_status || []" class="section-table">
            <ng-container matColumnDef="fee_type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let fee"><strong>{{ fee.fee_type }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let fee">₹{{ fee.amount | number }}</td>
            </ng-container>
            <ng-container matColumnDef="due_date">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let fee">{{ fee.due_date | date:'dd MMM yyyy' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['fee_type','amount','due_date']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['fee_type','amount','due_date'];"></tr>
          </table>
        </mat-card>

        <!-- Complaints Table -->
        <mat-card class="section-card glass-card full-width">
          <h2 class="section-title">
            <mat-icon class="section-icon">report_problem</mat-icon>
            My Complaints
          </h2>
          <table mat-table [dataSource]="dashboardData?.recent_complaints || []" class="section-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Issue</th>
              <td mat-cell *matCellDef="let c"><strong>{{ c.title }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="badge" [ngClass]="c.status | statusBadge">{{ c.status | titlecase }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['title','status']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['title','status'];"></tr>
          </table>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.5s ease-out; max-width: 1200px; padding: 0 16px 40px; }
    
    .welcome-banner {
      padding: 32px 40px; border-radius: 24px !important; color: #fff;
      display: flex; justify-content: space-between; align-items: center;
    }
    .welcome-text h1 { font-size: 28px; font-weight: 800; margin: 0; font-family: 'Outfit'; }
    .welcome-text p { font-size: 15px; opacity: 0.9; margin: 8px 0 0; font-family: 'Inter'; font-weight: 400; }
    
    .welcome-stats { display: flex; gap: 40px; }
    .mini-stat { display: flex; flex-direction: column; align-items: flex-end; }
    .mini-stat .label { font-size: 13px; font-weight: 600; text-transform: uppercase; opacity: 0.8; letter-spacing: 0.5px; }
    .mini-stat .value { font-size: 28px; font-weight: 800; font-family: 'Outfit'; line-height: 1.1; }
    
    .summary-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;
    }
    .summary-card {
      padding: 24px; border-radius: 24px !important; display: flex; align-items: center; gap: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover { transform: translateY(-4px) scale(1.02); }
    }
    .card-icon {
      width: 64px; height: 64px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 32px; width: 32px; height: 32px; }
    }
    .card-icon.room { background: rgba(16, 185, 129, 0.15); color: #059669; }
    .card-icon.fee { background: rgba(245, 158, 11, 0.15); color: #d97706; }
    .card-icon.complaint { background: rgba(239, 68, 68, 0.15); color: #dc2626; }
    
    .card-body { display: flex; flex-direction: column; justify-content: center; }
    .card-value { font-size: 32px; font-family: 'Outfit'; font-weight: 800; color: var(--text-main); line-height: 1.1; }
    .card-label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px; }
    
    .content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; }
    .tables-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
    
    .section-card { border-radius: 20px !important; padding: 24px !important; background: var(--card-bg) !important; }
    .section-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
    .section-icon { font-size: 22px; width: 22px; height: 22px; color: #059669; }
    
    .room-info-box { display: flex; flex-direction: column; gap: 16px; }
    .info-row { display: flex; gap: 24px; }
    .info-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .info-col .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .info-col .val { font-size: 15px; font-weight: 600; color: var(--text-main); }
    
    .notices-scroll { max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 8px; }
    .notice-card { padding: 16px; background: var(--surface-1); border-radius: 12px; border: 1px solid var(--border-color); }
    .notice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .notice-header h3 { font-size: 14px; font-weight: 700; margin: 0; color: var(--text-main); }
    .notice-card p { font-size: 13px; color: var(--text-muted); margin: 0 0 8px; line-height: 1.5; }
    .notice-card .date { font-size: 11px; color: var(--text-muted); }
    
    .section-table { width: 100%; }
    .empty-msg { text-align: center; color: #94a3b8; padding: 20px; font-size: 14px; }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @media (max-width: 1024px) {
      .content-grid, .tables-row { grid-template-columns: 1fr; }
    }
  `],
})
export class HostelerDashboardComponent implements OnInit, OnDestroy {
  dashboardData: HostelerDashboardData | null = null;
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private dataSubscription?: Subscription;

  ngOnInit() {
    // 1. Get initial data from resolver (Pre-fetched before page open)
    this.dashboardData = this.route.snapshot.data['dashboardData'];

    // 2. Subscribe to background updates (Stale-While-Revalidate)
    this.dataSubscription = this.authService.hostelerDashboard$.subscribe(data => {
      if (data) this.dashboardData = data;
    });

    // 3. Fallback: If resolver failed, fetch manually
    if (!this.dashboardData) {
      this.loadDashboardData();
    }
  }

  ngOnDestroy() {
    this.dataSubscription?.unsubscribe();
  }

  private loadDashboardData() {
    this.authService.getHostelerDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
      }
    });
  }

  getPendingFeesCount(): number {
    return this.dashboardData?.fee_status?.filter(fee => fee.status === 'pending' || fee.status === 'overdue').length || 0;
  }

  getTotalDues(): number {
    return this.dashboardData?.fee_status?.filter(fee => fee.status === 'pending' || fee.status === 'overdue')
      .reduce((sum, fee) => sum + fee.amount, 0) || 0;
  }

  getActiveComplaintsCount(): number {
    return this.dashboardData?.recent_complaints?.filter(complaint => complaint.status !== 'resolved').length || 0;
  }
}