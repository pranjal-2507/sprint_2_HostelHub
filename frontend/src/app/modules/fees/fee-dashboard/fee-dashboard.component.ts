import { Component, OnInit, ViewChild, inject, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { FeeService } from '../../../core/services';
import { FeeResponse } from '../../../core/models';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatSelectModule, MatFormFieldModule, MatSnackBarModule,
    MatMenuModule, RouterModule, StatusBadgePipe, SearchFilterComponent
  ],
  template: `
    <div class="fees-page">
      <h1 class="page-title">Fees & Payments</h1>

      @if (loading) {
        <div class="loading-state">
          <p>Loading fee data...</p>
        </div>
      } @else {
        <div class="stats-grid">
          @for (s of stats; track s.label) {
            <div class="stat-card">
              <div class="stat-icon" [style.background]="s.bg"><mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon></div>
              <div class="stat-body">
                <span class="stat-value">{{ s.value }}</span>
                <span class="stat-label">{{ s.label }}</span>
              </div>
            </div>
          }
        </div>

        <mat-card class="table-card" *ngIf="overdueCount > 0">
          <div class="alert-bar">
            <mat-icon>info</mat-icon>
            <span><strong>{{ overdueCount }}</strong> fee records are overdue</span>
          </div>
        </mat-card>

        <mat-card class="table-card">
          <div class="toolbar">
            <app-search-filter placeholder="Search students..." (searchChange)="applySearch($event)"></app-search-filter>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option value="paid">Paid</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="overdue">Overdue</mat-option>
              </mat-select>
            </mat-form-field>
            <span class="spacer"></span>
          </div>
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="studentName">
              <th mat-header-cell *matHeaderCellDef>Student</th>
              <td mat-cell *matCellDef="let f"><strong>{{ f.student_name }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="roomNumber">
              <th mat-header-cell *matHeaderCellDef>Room</th>
              <td mat-cell *matCellDef="let f">{{ f.room_number || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let f">₹{{ f.amount | number }}</td>
            </ng-container>
            <ng-container matColumnDef="feeType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let f">{{ f.fee_type | titlecase }}</td>
            </ng-container>
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let f">{{ f.due_date | date:'dd MMM yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let f">
                <span class="badge" [ngClass]="f.status | statusBadge">{{ f.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let f">
                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon class="action-icon">more_vert</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(f, 'paid')">
                    <mat-icon>check_circle</mat-icon> Mark Paid
                  </button>
                  <button mat-menu-item (click)="updateStatus(f, 'pending')">
                    <mat-icon>schedule</mat-icon> Mark Pending
                  </button>
                  <button mat-menu-item (click)="updateStatus(f, 'overdue')">
                    <mat-icon>warning</mat-icon> Mark Overdue
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .fees-page { max-width: 1200px; padding: 0 16px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 20px; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .stat-card {
      background: var(--card-bg); border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 14px; border: 1px solid var(--border-color);
    }
    .stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--text-main); }
    .stat-label { font-size: 12px; color: var(--text-muted); }
    .table-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 0 !important; margin-bottom: 16px; }
    .alert-bar {
      display: flex; align-items: center; gap: 8px; padding: 12px 20px; color: #d97706;
      background: var(--surface-2); border-radius: 12px; font-size: 13px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .toolbar { display: flex; gap: 12px; align-items: center; padding: 16px 20px; flex-wrap: wrap; }
    .filter-field { max-width: 160px; }
    .spacer { flex: 1; }
    table { width: 100%; background: transparent !important; }
    strong { color: var(--text-main); }
    .badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .action-icon { color: var(--text-muted); }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } }
  `],
})
export class FeeDashboardComponent implements OnInit, AfterViewInit {
  columns = ['studentName', 'roomNumber', 'amount', 'feeType', 'dueDate', 'status', 'actions'];
  dataSource = new MatTableDataSource<FeeResponse>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  loading = true;
  private feeService = inject(FeeService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  allFees: FeeResponse[] = [];
  overdueCount = 0;

  stats = [
    { label: 'Total Collected', value: '₹0', icon: 'account_balance_wallet', color: '#059669', bg: '#ecfdf5' },
    { label: 'Pending Amount', value: '₹0', icon: 'schedule', color: '#d97706', bg: '#fffbeb' },
    { label: 'Total Records', value: '0', icon: 'people', color: '#4f46e5', bg: '#eef2ff' },
  ];

  ngOnInit(): void {
    this.fetchFees();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.cdr.detectChanges();
  }

  fetchFees(): void {
    this.loading = true;
    this.feeService.getAll().subscribe({
      next: (data) => {
        this.allFees = data;
        this.dataSource.data = data;
        this.calculateStats();
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

  calculateStats(): void {
    const totalCollected = this.allFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalPending = this.allFees
      .filter(f => f.status === 'pending' || f.status === 'overdue')
      .reduce((sum, f) => sum + f.amount, 0);
    
    this.stats[0].value = `₹${totalCollected.toLocaleString()}`;
    this.stats[1].value = `₹${totalPending.toLocaleString()}`;
    this.stats[2].value = this.allFees.length.toString();
    
    this.overdueCount = this.allFees.filter(f => f.status === 'overdue').length;
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByStatus(s: string): void {
    this.dataSource.data = s ? this.allFees.filter(f => f.status.toLowerCase() === s.toLowerCase()) : this.allFees;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.cdr.detectChanges();
  }

  updateStatus(fee: FeeResponse, newStatus: string): void {
    this.feeService.updateStatus(fee.id, newStatus).subscribe({
      next: () => {
        this.fetchFees();
        this.snackBar.open(`Payment status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error updating fee status', err);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }
}
