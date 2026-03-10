import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { Fee } from '../../../core/models';

@Component({
  selector: 'app-fee-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatPaginatorModule, StatusBadgePipe, SearchFilterComponent],
  template: `
    <div class="fees-page">
      <h1 class="page-title">Fee Tracking</h1>

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

      <mat-card class="table-card" *ngIf="overdueStudents.length">
        <div class="alert-bar">
          <mat-icon>info</mat-icon>
          <span><strong>{{ overdueStudents.length }}</strong> students have overdue payments</span>
        </div>
      </mat-card>

      <mat-card class="table-card">
        <div class="toolbar">
          <app-search-filter placeholder="Search students..." (searchChange)="applySearch($event)"></app-search-filter>
        </div>
        <table mat-table [dataSource]="dataSource">
          <ng-container matColumnDef="studentName">
            <th mat-header-cell *matHeaderCellDef>Student</th>
            <td mat-cell *matCellDef="let f"><strong>{{ f.studentName }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef>Room</th>
            <td mat-cell *matCellDef="let f">{{ f.roomNumber }}</td>
          </ng-container>
          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef>Total</th>
            <td mat-cell *matCellDef="let f">₹{{ f.totalAmount | number }}</td>
          </ng-container>
          <ng-container matColumnDef="paidAmount">
            <th mat-header-cell *matHeaderCellDef>Paid</th>
            <td mat-cell *matCellDef="let f" style="color:#059669">₹{{ f.paidAmount | number }}</td>
          </ng-container>
          <ng-container matColumnDef="pendingAmount">
            <th mat-header-cell *matHeaderCellDef>Pending</th>
            <td mat-cell *matCellDef="let f" style="color:#d97706">₹{{ f.pendingAmount | number }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let f">
              <span class="badge" [ngClass]="f.status | statusBadge">{{ f.status | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="dueDate">
            <th mat-header-cell *matHeaderCellDef>Due Date</th>
            <td mat-cell *matCellDef="let f">{{ f.dueDate }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .fees-page { max-width: 1200px; }
    .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0 0 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
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
    .table-card { background: #fff !important; border: 1px solid #f1f5f9; border-radius: 12px !important; padding: 0 !important; margin-bottom: 16px; }
    .alert-bar {
      display: flex; align-items: center; gap: 8px; padding: 12px 20px; color: #d97706;
      background: #fffbeb; border-radius: 12px; font-size: 13px;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .toolbar { padding: 16px 20px; }
    table { width: 100%; }
    strong { color: #1e293b; }
    .badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export class FeeDashboardComponent implements OnInit {
  columns = ['studentName', 'roomNumber', 'totalAmount', 'paidAmount', 'pendingAmount', 'status', 'dueDate'];
  dataSource = new MatTableDataSource<Fee>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  overdueStudents: Fee[] = [];

  stats = [
    { label: 'Collected', value: '₹4,80,000', icon: 'account_balance_wallet', color: '#059669', bg: '#ecfdf5' },
    { label: 'Pending', value: '₹1,20,000', icon: 'schedule', color: '#d97706', bg: '#fffbeb' },
    { label: 'Overdue', value: '₹35,000', icon: 'warning_amber', color: '#dc2626', bg: '#fef2f2' },
    { label: 'Students', value: '156', icon: 'people', color: '#4f46e5', bg: '#eef2ff' },
  ];

  mockFees: Fee[] = [
    { id: '1', studentId: 's1', studentName: 'Rahul Sharma', hostelId: 'h1', roomNumber: '101', totalAmount: 48000, paidAmount: 48000, pendingAmount: 0, dueDate: '2024-03-15', status: 'paid', payments: [] },
    { id: '2', studentId: 's2', studentName: 'Priya Singh', hostelId: 'h1', roomNumber: '102', totalAmount: 36000, paidAmount: 24000, pendingAmount: 12000, dueDate: '2024-03-10', status: 'partial', payments: [] },
    { id: '3', studentId: 's3', studentName: 'Amit Kumar', hostelId: 'h1', roomNumber: '201', totalAmount: 30000, paidAmount: 0, pendingAmount: 30000, dueDate: '2024-02-28', status: 'overdue', payments: [] },
    { id: '4', studentId: 's4', studentName: 'Sneha Patel', hostelId: 'h1', roomNumber: '202', totalAmount: 48000, paidAmount: 48000, pendingAmount: 0, dueDate: '2024-04-01', status: 'paid', payments: [] },
    { id: '5', studentId: 's5', studentName: 'Ravi Verma', hostelId: 'h1', roomNumber: '301', totalAmount: 36000, paidAmount: 12000, pendingAmount: 24000, dueDate: '2024-03-01', status: 'overdue', payments: [] },
    { id: '6', studentId: 's6', studentName: 'Meena Gupta', hostelId: 'h1', roomNumber: '303', totalAmount: 48000, paidAmount: 36000, pendingAmount: 12000, dueDate: '2024-03-20', status: 'partial', payments: [] },
  ];

  ngOnInit(): void { this.dataSource.data = this.mockFees; this.overdueStudents = this.mockFees.filter(f => f.status === 'overdue'); }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }
  applySearch(v: string): void { this.dataSource.filter = v.trim().toLowerCase(); }
}
