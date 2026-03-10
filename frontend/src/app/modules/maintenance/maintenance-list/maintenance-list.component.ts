import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { MaintenanceRequestFormComponent } from '../maintenance-request-form/maintenance-request-form.component';
import { MaintenanceRequest } from '../../../core/models';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, SearchFilterComponent, StatusBadgePipe,
  ],
  template: `
    <div class="maintenance-page">
      <div class="page-header">
        <h1 class="page-title">Maintenance Requests</h1>
        <button mat-flat-button class="primary-btn" (click)="openRequestDialog()">
          <mat-icon>add</mat-icon> New Request
        </button>
      </div>

      <div class="summary-row">
        @for (s of miniStats; track s.label) {
          <div class="summary-item">
            <span class="summary-num" [style.color]="s.color">{{ s.value }}</span>
            <span class="summary-label">{{ s.label }}</span>
          </div>
        }
      </div>

      <mat-card class="table-card">
        <div class="toolbar">
          <app-search-filter placeholder="Search..." (searchChange)="applySearch($event)"></app-search-filter>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select (selectionChange)="filterByStatus($event.value)">
              <mat-option value="">All</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="resolved">Resolved</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let r"><strong>{{ r.title }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef>Room</th>
            <td mat-cell *matCellDef="let r">{{ r.roomNumber }}</td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let r">{{ r.category | titlecase }}</td>
          </ng-container>
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [ngClass]="r.priority | statusBadge">{{ r.priority | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge" [ngClass]="r.status | statusBadge">{{ r.status | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let r">{{ r.createdAt }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .maintenance-page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; font-weight: 500; height: 40px; }
    .summary-row { display: flex; gap: 24px; margin-bottom: 20px; }
    .summary-item { display: flex; flex-direction: column; }
    .summary-num { font-size: 28px; font-weight: 700; }
    .summary-label { font-size: 12px; color: #94a3b8; }
    .table-card { background: #fff !important; border: 1px solid #f1f5f9; border-radius: 12px !important; padding: 0 !important; }
    .toolbar { display: flex; gap: 12px; align-items: center; padding: 16px 20px; flex-wrap: wrap; }
    .filter-field { max-width: 160px; }
    table { width: 100%; }
    strong { color: #1e293b; }
    .badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
  `],
})
export class MaintenanceListComponent implements OnInit {
  displayedColumns = ['title', 'roomNumber', 'category', 'priority', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<MaintenanceRequest>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  miniStats = [
    { label: 'Pending', value: 5, color: '#d97706' },
    { label: 'In Progress', value: 3, color: '#2563eb' },
    { label: 'Resolved', value: 12, color: '#059669' },
  ];

  mockData: MaintenanceRequest[] = [
    { id: '1', hostelId: 'h1', roomId: 'r1', roomNumber: '101', title: 'Leaking Faucet', description: '', category: 'plumbing', priority: 'high', status: 'pending', requestedBy: 'Rahul', createdAt: '2024-03-01', updatedAt: '' },
    { id: '2', hostelId: 'h1', roomId: 'r2', roomNumber: '205', title: 'Broken AC', description: '', category: 'electrical', priority: 'urgent', status: 'in-progress', requestedBy: 'Priya', createdAt: '2024-03-02', updatedAt: '' },
    { id: '3', hostelId: 'h1', roomId: 'r3', roomNumber: '312', title: 'Damaged Chair', description: '', category: 'furniture', priority: 'low', status: 'resolved', requestedBy: 'Amit', createdAt: '2024-02-28', updatedAt: '', resolvedAt: '2024-03-03' },
    { id: '4', hostelId: 'h1', roomId: 'r4', roomNumber: '118', title: 'Room Cleaning', description: '', category: 'cleaning', priority: 'medium', status: 'pending', requestedBy: 'Sneha', createdAt: '2024-03-04', updatedAt: '' },
    { id: '5', hostelId: 'h1', roomId: 'r5', roomNumber: '401', title: 'Power Socket Issue', description: '', category: 'electrical', priority: 'high', status: 'in-progress', requestedBy: 'Ravi', createdAt: '2024-03-03', updatedAt: '' },
  ];

  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { this.dataSource.data = this.mockData; }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; }
  applySearch(v: string): void { this.dataSource.filter = v.trim().toLowerCase(); }
  filterByStatus(s: string): void { this.dataSource.data = s ? this.mockData.filter(r => r.status === s) : this.mockData; }
  filterByPriority(p: string): void { this.dataSource.data = p ? this.mockData.filter(r => r.priority === p) : this.mockData; }
  openRequestDialog(): void { this.dialog.open(MaintenanceRequestFormComponent, { width: '480px' }); }
}
