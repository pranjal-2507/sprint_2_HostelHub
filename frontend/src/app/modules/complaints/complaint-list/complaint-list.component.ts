import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { ComplaintService } from '../../../core/services/complaint.service';
import { Complaint } from '../../../core/models';

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, MatSnackBarModule, MatMenuModule, SearchFilterComponent, StatusBadgePipe,
  ],
  template: `
    <div class="complaints-page">
      <div class="page-header">
        <h1 class="page-title">Manage Complaints</h1>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading complaints...</p>
        </div>
      } @else {
        <mat-card class="table-card">
          <div class="toolbar">
            <app-search-filter placeholder="Search complaints..." (searchChange)="applySearch($event)"></app-search-filter>
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
            <ng-container matColumnDef="studentName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
              <td mat-cell *matCellDef="let c"><strong>{{ c.student_name || 'Unknown' }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="roomNumber">
              <th mat-header-cell *matHeaderCellDef>Room</th>
              <td mat-cell *matCellDef="let c">{{ c.room_number || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Issue</th>
              <td mat-cell *matCellDef="let c">{{ c.title }}</td>
            </ng-container>
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let c">
                <span class="badge" [ngClass]="'priority-' + c.priority">{{ c.priority | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let c">
                <span class="badge" [ngClass]="c.status | statusBadge">{{ c.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let c">{{ c.created_at | date:'dd MMM yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon class="action-icon">more_vert</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(c, 'pending')">
                    <mat-icon>schedule</mat-icon> Mark Pending
                  </button>
                  <button mat-menu-item (click)="updateStatus(c, 'in-progress')">
                    <mat-icon>autorenew</mat-icon> Mark In Progress
                  </button>
                  <button mat-menu-item (click)="updateStatus(c, 'resolved')">
                    <mat-icon>check_circle</mat-icon> Mark Resolved
                  </button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .complaints-page { max-width: 1200px; padding: 0 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .table-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 0 !important; }
    .toolbar { display: flex; gap: 12px; align-items: center; padding: 16px 20px; flex-wrap: wrap; }
    .filter-field { max-width: 160px; }
    table { width: 100%; background: transparent !important; }
    strong { color: var(--text-main); }
    .badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .priority-high { background: var(--badge-danger-bg); color: var(--badge-danger-text); }
    .priority-medium { background: var(--badge-warning-bg); color: var(--badge-warning-text); }
    .priority-low { background: var(--badge-success-bg); color: var(--badge-success-text); }
    .action-icon { color: var(--text-muted); }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `],
})
export class ComplaintListComponent implements OnInit {
  displayedColumns = ['studentName', 'roomNumber', 'title', 'priority', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = true;
  private complaintService = inject(ComplaintService);
  private snackBar = inject(MatSnackBar);

  allComplaints: any[] = [];

  ngOnInit(): void {
    this.fetchComplaints();
  }

  fetchComplaints(): void {
    this.loading = true;
    this.complaintService.getAll().subscribe({
      next: (data) => {
        this.allComplaints = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching complaints', err);
        this.loading = false;
      }
    });
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByStatus(s: string): void {
    this.dataSource.data = s ? this.allComplaints.filter(c => c.status === s) : this.allComplaints;
  }

  updateStatus(complaint: any, newStatus: string): void {
    this.complaintService.updateStatus(complaint.id, newStatus).subscribe({
      next: () => {
        this.fetchComplaints();
        this.snackBar.open(`Complaint status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error updating status', err);
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }
}
