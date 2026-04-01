import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NoticeFormDialogComponent } from '../notice-form-dialog/notice-form-dialog.component';
import { NoticeService } from '../../../core/services/notice.service';

@Component({
  selector: 'app-notice-list',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule, SearchFilterComponent,
  ],
  template: `
    <div class="notices-page">
      <div class="page-header">
        <h1 class="page-title">Manage Notices</h1>
        <button mat-flat-button class="primary-btn" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Create Notice
        </button>
      </div>

      <div class="toolbar-row">
        <app-search-filter placeholder="Search notices..." (searchChange)="applySearch($event)"></app-search-filter>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading notices...</p>
        </div>
      } @else {
        <div class="notices-grid">
          @for (notice of filteredNotices; track notice.id) {
            <mat-card class="notice-card" [class.high-priority]="notice.priority === 'high'">
              <div class="notice-header">
                <div class="notice-meta">
                  <span class="category-chip" [ngClass]="'cat-' + notice.category">{{ notice.category | titlecase }}</span>
                  <span class="priority-chip" [ngClass]="'pri-' + notice.priority">{{ notice.priority | titlecase }}</span>
                </div>
                <div class="notice-actions">
                  <button mat-icon-button (click)="openEditDialog(notice)">
                    <mat-icon class="action-icon edit">edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteNotice(notice)">
                    <mat-icon class="action-icon delete">delete</mat-icon>
                  </button>
                </div>
              </div>
              <h3 class="notice-title">{{ notice.title }}</h3>
              <p class="notice-content">{{ notice.content }}</p>
              <div class="notice-footer">
                <span class="notice-author"><mat-icon>person</mat-icon> Admin</span>
                <span class="notice-date">{{ notice.created_at | date:'dd MMM yyyy' }}</span>
              </div>
            </mat-card>
          }
        </div>

        @if (filteredNotices.length === 0) {
          <div class="empty-state">
            <mat-icon>campaign_outlined</mat-icon>
            <p>No notices found</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .notices-page { max-width: 1200px; padding: 0 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
    .toolbar-row { margin-bottom: 20px; }
    .notices-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }
    .notice-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 20px !important;
      transition: transform 0.2s;
      &:hover { transform: translateY(-3px); }
    }
    .notice-card.high-priority { border-left: 4px solid #dc2626 !important; }
    .notice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .notice-meta { display: flex; gap: 8px; }
    .category-chip, .priority-chip { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .cat-general { background: var(--surface-2); color: var(--text-muted); }
    .cat-event { background: #eef2ff; color: #4f46e5; }
    .cat-rules { background: #ecfeff; color: #0891b2; }
    .cat-emergency { background: #fef2f2; color: #dc2626; }
    .cat-maintenance { background: #fffbeb; color: #d97706; }
    .pri-low { background: #ecfdf5; color: #059669; }
    .pri-medium { background: #fffbeb; color: #d97706; }
    .pri-high { background: #fef2f2; color: #dc2626; }
    .notice-actions { display: flex; gap: 0; }
    .action-icon { font-size: 18px; }
    .action-icon.edit { color: #4f46e5; }
    .action-icon.delete { color: #dc2626; }
    .notice-title { font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0 0 8px; }
    .notice-content { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin: 0 0 16px; }
    .notice-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-color); }
    .notice-author { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .notice-date { font-size: 12px; color: var(--text-muted); }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; } p { font-size: 14px; margin-top: 8px; } }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `],
})
export class NoticeListComponent implements OnInit {
  loading = true;
  private noticeService = inject(NoticeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  allNotices: any[] = [];
  filteredNotices: any[] = [];
  searchTerm = '';

  ngOnInit(): void {
    this.fetchNotices();
  }

  fetchNotices(): void {
    this.loading = true;
    this.noticeService.getAllNotices().subscribe({
      next: (data) => {
        this.allNotices = data;
        this.applySearch(this.searchTerm);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching notices', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applySearch(v: string): void {
    this.searchTerm = v.trim().toLowerCase();
    this.filteredNotices = this.searchTerm
      ? this.allNotices.filter(n => n.title.toLowerCase().includes(this.searchTerm) || n.content.toLowerCase().includes(this.searchTerm))
      : [...this.allNotices];
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(NoticeFormDialogComponent, { width: '520px', data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.noticeService.createNotice(result).subscribe({
          next: () => {
            this.fetchNotices();
            this.snackBar.open('Notice created successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error creating notice', err);
            this.snackBar.open('Failed to create notice', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(notice: any): void {
    const dialogRef = this.dialog.open(NoticeFormDialogComponent, { width: '520px', data: { notice } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Implement update API if needed
        this.fetchNotices();
        this.snackBar.open('Notice updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteNotice(notice: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Delete Notice', message: `Are you sure you want to delete "${notice.title}"?`, confirmText: 'Delete', color: 'warn' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.noticeService.deleteNotice(notice.id).subscribe({
          next: () => {
            this.fetchNotices();
            this.snackBar.open('Notice deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting notice', err);
            this.snackBar.open('Failed to delete notice', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
