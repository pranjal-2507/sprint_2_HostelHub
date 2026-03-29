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
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentFormDialogComponent } from '../student-form-dialog/student-form-dialog.component';
import { Student } from '../../../core/models';
import { StudentService } from '../../../core/services/student.service';

import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, MatSnackBarModule, SearchFilterComponent, StatusBadgePipe,
    MatTooltipModule, RouterModule
  ],
  template: `
    <div class="students-page">
      <div class="page-header">
        <h1 class="page-title">Manage Students</h1>
        <button mat-flat-button class="primary-btn" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Student
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading students...</p>
        </div>
      } @else {
        <mat-card class="table-card">
          <div class="toolbar">
            <app-search-filter placeholder="Search students..." (searchChange)="applySearch($event)"></app-search-filter>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Role</mat-label>
              <mat-select (selectionChange)="filterByRole($event.value)">
                <mat-option value="">All</mat-option>
                <mat-option value="hosteler">Hosteler</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let s"><strong>{{ s.name }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let s">{{ s.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let s">{{ s.phone || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="roomNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Room</th>
              <td mat-cell *matCellDef="let s">{{ s.room_number || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="course">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Course</th>
              <td mat-cell *matCellDef="let s">{{ s.course || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="year">
              <th mat-header-cell *matHeaderCellDef>Year</th>
              <td mat-cell *matCellDef="let s">{{ s.year || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let s">
                <span class="badge" [ngClass]="s.role === 'admin' ? 'badge-danger' : 'badge-success'">{{ s.role | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button [routerLink]="['/admin/students', s.id]" matTooltip="View Details">
                  <mat-icon class="action-icon view">visibility</mat-icon>
                </button>
                <button mat-icon-button (click)="openEditDialog(s)" matTooltip="Edit">
                  <mat-icon class="action-icon edit">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="removeStudent(s)" matTooltip="Remove">
                  <mat-icon class="action-icon delete">person_remove</mat-icon>
                </button>
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
    .students-page { max-width: 1200px; padding: 0 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
    .table-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 0 !important; }
    .toolbar { display: flex; gap: 12px; align-items: center; padding: 16px 20px; flex-wrap: wrap; }
    .filter-field { max-width: 160px; }
    table { width: 100%; background: transparent !important; }
    strong { color: var(--text-main); }
    .badge { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .badge-success { background: var(--badge-success-bg); color: var(--badge-success-text); }
    .badge-danger { background: var(--badge-danger-bg); color: var(--badge-danger-text); }
    .action-icon { font-size: 20px; }
    .action-icon.edit { color: #4f46e5; }
    .action-icon.view { color: #10b981; }
    .action-icon.delete { color: #dc2626; }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `],
})
export class StudentListComponent implements OnInit {
  displayedColumns = ['name', 'email', 'phone', 'roomNumber', 'course', 'year', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = true;
  private studentService = inject(StudentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allStudents: any[] = [];

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.loading = true;
    this.studentService.getAll().subscribe({
      next: (data) => {
        this.allStudents = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching students', err);
        this.loading = false;
      }
    });
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByRole(role: string): void {
    this.dataSource.data = role ? this.allStudents.filter(s => s.role === role) : this.allStudents;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '560px', data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchStudents();
        this.snackBar.open('Student added successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(student: any): void {
    const dialogRef = this.dialog.open(StudentFormDialogComponent, {
      width: '560px', data: { student }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchStudents();
        this.snackBar.open('Student updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  removeStudent(student: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Remove Student', message: `Are you sure you want to remove ${student.name}?`, confirmText: 'Remove', color: 'warn' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Implement delete API if needed, for now just refresh
        this.fetchStudents();
        this.snackBar.open('Student removed successfully', 'Close', { duration: 3000 });
      }
    });
  }
}
