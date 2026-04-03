import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { FeeService } from '../../../core/services/fee.service';
import { Fee } from '../../../core/models';

@Component({
  selector: 'app-hosteler-payments',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, MatTabsModule, StatusBadgePipe],
  template: `
    <div class="payments">
      <h1 class="page-title">Payments & Fees</h1>

      @if (loading) {
        <div class="loading-state">
          <p>Loading payment information...</p>
        </div>
      } @else {
        <!-- Payment Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card total-card">
            <div class="card-icon" style="background: var(--surface-2); color: #4f46e5;">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">₹{{ getTotalAmount() | number }}</span>
              <span class="card-label">Total Fees</span>
            </div>
          </div>

          <div class="summary-card paid-card">
            <div class="card-icon" style="background: var(--surface-2); color: #059669;">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">₹{{ getPaidAmount() | number }}</span>
              <span class="card-label">Paid Amount</span>
            </div>
          </div>

          <div class="summary-card pending-card">
            <div class="card-icon" style="background: var(--surface-2); color: #d97706;">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">₹{{ getPendingAmount() | number }}</span>
              <span class="card-label">Pending Amount</span>
            </div>
          </div>

          <div class="summary-card overdue-card">
            <div class="card-icon" style="background: var(--surface-2); color: #dc2626;">
              <mat-icon>warning</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">₹{{ getOverdueAmount() | number }}</span>
              <span class="card-label">Overdue Amount</span>
            </div>
          </div>
        </div>

        <!-- Tabs for different views -->
        <mat-tab-group class="payment-tabs">
          <mat-tab label="All Payments">
            <div class="tab-content">
              <mat-card class="payments-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <mat-icon>receipt</mat-icon>
                    Payment History
                  </h2>
                </div>
                @if (allFees.length > 0) {
                  <table mat-table [dataSource]="allFees" class="payments-table">
                    <ng-container matColumnDef="fee_type">
                      <th mat-header-cell *matHeaderCellDef>Fee Type</th>
                      <td mat-cell *matCellDef="let fee">
                        <div class="fee-type">
                          <mat-icon class="fee-icon">{{ getFeeIcon(fee.fee_type) }}</mat-icon>
                          <strong>{{ fee.fee_type }}</strong>
                        </div>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef>Amount</th>
                      <td mat-cell *matCellDef="let fee">
                        <span class="amount">₹{{ fee.amount | number }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="due_date">
                      <th mat-header-cell *matHeaderCellDef>Due Date</th>
                      <td mat-cell *matCellDef="let fee">{{ fee.due_date | date:'dd MMM yyyy' }}</td>
                    </ng-container>
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let fee">
                        <span class="badge" [ngClass]="fee.status | statusBadge">{{ fee.status | titlecase }}</span>
                      </td>
                    </ng-container>
                    <ng-container matColumnDef="paid_at">
                      <th mat-header-cell *matHeaderCellDef>Paid Date</th>
                      <td mat-cell *matCellDef="let fee">
                        {{ fee.paid_at ? (fee.paid_at | date:'dd MMM yyyy') : '-' }}
                      </td>
                    </ng-container>
                    <tr mat-header-row *matHeaderRowDef="['fee_type','amount','due_date','status','paid_at']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['fee_type','amount','due_date','status','paid_at'];"></tr>
                  </table>
                } @else {
                  <div class="empty-state">
                    <mat-icon>receipt</mat-icon>
                    <p>No payment records found</p>
                  </div>
                }
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Pending Payments">
            <div class="tab-content">
              <mat-card class="payments-card">
                <div class="card-header">
                  <h2 class="card-title">
                    <mat-icon>pending_actions</mat-icon>
                    Pending Payments
                  </h2>
                </div>
                @if (pendingFees.length > 0) {
                  <div class="pending-fees-list">
                    @for (fee of pendingFees; track fee.id) {
                      <div class="pending-fee-item" [class.overdue]="fee.status === 'overdue'">
                        <div class="fee-info">
                          <div class="fee-header">
                            <mat-icon class="fee-type-icon">{{ getFeeIcon(fee.fee_type) }}</mat-icon>
                            <div class="fee-details">
                              <h3 class="fee-name">{{ fee.fee_type }}</h3>
                              <p class="fee-amount">₹{{ fee.amount | number }}</p>
                            </div>
                          </div>
                          <div class="fee-meta">
                            <span class="due-date">
                              <mat-icon>schedule</mat-icon>
                              Due: {{ fee.due_date | date:'dd MMM yyyy' }}
                            </span>
                          </div>
                        </div>
                        <div class="fee-actions">
                          <button mat-raised-button color="primary" (click)="payFee(fee)">
                            <mat-icon>payment</mat-icon>
                            Pay Now
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="empty-state">
                    <mat-icon>check_circle</mat-icon>
                    <p>No pending payments</p>
                    <span>All your fees are up to date!</span>
                  </div>
                }
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .payments { max-width: 1200px; padding: 0 16px; margin: 0 auto; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 24px; }
    
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }

    .summary-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .summary-card {
      background: var(--card-bg); border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      border: 1px solid var(--border-color);
    }
    .card-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .card-content { display: flex; flex-direction: column; }
    .card-value { font-size: 20px; font-weight: 700; color: var(--text-main); }
    .card-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    
    .payment-tabs { margin-bottom: 16px; }
    .tab-content { padding-top: 16px; }
    
    .payments-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 24px !important;
    }
    .card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
    }
    .card-title {
      font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0;
      display: flex; align-items: center; gap: 8px;
      mat-icon { color: #059669; }
    }
    
    .payments-table { width: 100%; background: transparent !important; }
    .fee-type {
      display: flex; align-items: center; gap: 8px;
    }
    .fee-icon { font-size: 18px; width: 18px; height: 18px; color: #059669; }
    .amount { font-weight: 600; color: var(--text-main); }
    
    .pending-fees-list {
      display: flex; flex-direction: column; gap: 16px;
    }
    .pending-fee-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px; border: 1px solid var(--border-color); border-radius: 12px;
      background: var(--surface-2);
      &.overdue { border-color: #f87171; background: var(--badge-danger-bg); }
    }
    
    .fee-info { flex: 1; }
    .fee-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    }
    .fee-type-icon { font-size: 24px; width: 24px; height: 24px; color: #059669; }
    .fee-details {
      .fee-name { font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0; }
      .fee-amount { font-size: 14px; color: var(--text-muted); margin: 2px 0 0; }
    }
    .fee-meta { display: flex; align-items: center; gap: 16px; }
    .due-date {
      display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-muted);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    
    .empty-state {
      text-align: center; padding: 60px 20px; color: #94a3b8;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
      p { margin: 0 0 4px; font-size: 16px; font-weight: 500; }
      span { font-size: 14px; }
    }
    
    .badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    
    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .summary-grid { grid-template-columns: 1fr; }
      .card-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .pending-fee-item { flex-direction: column; align-items: flex-start; gap: 16px; }
      .fee-actions { width: 100%; justify-content: flex-end; }
    }
  `],
})
export class HostelerPaymentsComponent implements OnInit {
  allFees: Fee[] = [];
  pendingFees: Fee[] = [];
  paidFees: Fee[] = [];
  loading = true;

  private feeService = inject(FeeService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.fetchFees();
  }

  fetchFees() {
    this.loading = true;
    this.feeService.getHostelerFees().subscribe({
      next: (fees) => {
        this.allFees = fees;
        this.pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue');
        this.paidFees = fees.filter(f => f.status === 'paid');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching fees', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTotalAmount(): number {
    return this.allFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  }

  getPaidAmount(): number {
    return this.paidFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  }

  getPendingAmount(): number {
    return this.pendingFees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  }

  getOverdueAmount(): number {
    return this.allFees.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + Number(fee.amount), 0);
  }

  getFeeIcon(feeType: string): string {
    const iconMap: { [key: string]: string } = {
      'Monthly Rent': 'home',
      'Semester Fee': 'school',
      'Mess Fee': 'restaurant',
      'Maintenance Fee': 'build',
      'Security Deposit': 'security',
      'Electricity Bill': 'electrical_services'
    };
    return iconMap[feeType] || 'receipt';
  }

  payFee(fee: Fee) {
    alert(`Redirecting to payment gateway for ${fee.fee_type} - ₹${fee.amount}`);
  }
}