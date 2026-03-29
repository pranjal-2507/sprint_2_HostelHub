import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { MaintenanceRequest } from '../../../core/models';
import { MaintenanceService } from '../../../core/services';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, SearchFilterComponent,
  ],
  template: `
    <div class="maintenance-page">
      <div class="page-header">
        <h1 class="page-title">Maintenance Requests</h1>
        <button mat-flat-button class="primary-btn">
          <mat-icon>add</mat-icon> New Request
        </button>
      </div>

      <mat-card class="table-card">
        <div class="toolbar">
          <app-search-filter placeholder="Search requests..." (searchChange)="applySearch($event)"></app-search-filter>
          <div class="filters">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select (selectionChange)="filterByStatus($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="in-progress">In Progress</mat-option>
                <mat-option value="resolved">Resolved</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Priority</mat-label>
              <mat-select (selectionChange)="filterByPriority($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option value="low">Low</mat-option>
                <mat-option value="medium">Medium</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="urgent">Urgent</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let r">
              <div class="title-cell">
                <span class="main-title">{{ r.title }}</span>
                <span class="requested-by">by {{ r.requestedBy }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Room</th>
            <td mat-cell *matCellDef="let r">{{ r.roomNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let r">{{ r.category | titlecase }}</td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge-priority" [ngClass]="'prio-' + r.priority">{{ r.priority | titlecase }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let r">
              <span class="badge-status" [ngClass]="'status-' + r.status">{{ r.status | uppercase }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.createdAt | date:'dd MMM' }}</td>
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let r">{{ r.createdAt | date }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        @if (dataSource.data.length === 0) {
          <div class="empty-state">
            <mat-icon>plumbing</mat-icon>
            <p>No maintenance requests found</p>
          </div>
        }
        
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .maintenance-page { max-width: 1200px; padding: 0 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
    .table-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 0 !important; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; flex-wrap: wrap; gap: 12px; }
    .filters { display: flex; gap: 12px; }
    .filter-field { width: 140px; }
    table { width: 100%; background: transparent !important; }
    .title-cell { display: flex; flex-direction: column; }
    .main-title { font-weight: 600; color: var(--text-main); }
    .requested-by { font-size: 11px; color: var(--text-muted); }
    .badge-status { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .status-pending { background: #fef2f2; color: #dc2626; }
    .status-in-progress { background: #fffbeb; color: #d97706; }
    .status-resolved { background: #ecfdf5; color: #059669; }
    .badge-priority { font-size: 12px; font-weight: 500; }
    .prio-high, .prio-urgent { color: #dc2626; }
    .prio-medium { color: #d97706; }
    .prio-low { color: #059669; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; } p { font-size: 14px; margin-top: 8px; } }
    @media (max-width: 768px) { .toolbar { flex-direction: column; align-items: stretch; } .filters { flex-direction: column; } .filter-field { width: 100%; } }
  `],
})
export class MaintenanceListComponent implements OnInit {
  displayedColumns = ['title', 'roomNumber', 'category', 'priority', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<MaintenanceRequest>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = false;

  ngOnInit(): void { 
    this.dataSource.data = []; 
  }
  
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByStatus(s: string): void {
    // Logic will be updated when service is implemented
    this.dataSource.data = [];
  }

  filterByPriority(p: string): void {
    // Logic will be updated when service is implemented
    this.dataSource.data = [];
  miniStats: any[] = [];

  constructor(
    private dialog: MatDialog,
    private maintenanceService: MaintenanceService
  ) { }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRequests(status?: string): void {
    this.maintenanceService.getAll({ status }).subscribe({
      next: (requests) => {
        this.dataSource.data = requests;
        this.calculateStats(requests);
      },
      error: (err) => console.error('Error loading maintenance requests', err)
    });
  }

  private calculateStats(requests: MaintenanceRequest[]): void {
    this.miniStats = [
      { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: '#d97706' },
      { label: 'In Progress', value: requests.filter(r => r.status === 'in-progress').length, color: '#2563eb' },
      { label: 'Resolved', value: requests.filter(r => r.status === 'resolved').length, color: '#059669' },
    ];
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByStatus(s: string): void {
    this.loadRequests(s || undefined);
  }

  openRequestDialog(): void {
    this.dialog.open(MaintenanceRequestFormComponent, { width: '480px' });
  }
}
