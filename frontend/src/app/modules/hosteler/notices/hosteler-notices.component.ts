import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { NoticeService } from '../../../core/services/notice.service';

@Component({
  selector: 'app-hosteler-notices',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule, MatTabsModule],
  template: `
    <div class="notices">
      <h1 class="page-title">Notices & Announcements</h1>

      @if (loading) {
        <div class="loading-state">
          <p>Loading notices...</p>
        </div>
      } @else {
        <!-- Notice Summary -->
        <div class="summary-grid">
          <div class="summary-card total-card">
            <div class="card-icon" style="background: var(--surface-2); color: #4f46e5;">
              <mat-icon>campaign</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ notices.length }}</span>
              <span class="card-label">Total Notices</span>
            </div>
          </div>

          <div class="summary-card high-card">
            <div class="card-icon" style="background: #fef2f2; color: #dc2626;">
              <mat-icon>priority_high</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ getHighPriorityCount() }}</span>
              <span class="card-label">High Priority</span>
            </div>
          </div>

          <div class="summary-card recent-card">
            <div class="card-icon" style="background: #ecfdf5; color: #059669;">
              <mat-icon>new_releases</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ getRecentCount() }}</span>
              <span class="card-label">This Week</span>
            </div>
          </div>
        </div>

        <!-- Tabs for different priority levels -->
        <mat-tab-group class="notice-tabs">
          <mat-tab label="All Notices">
            <div class="tab-content">
              <div class="notices-list">
                @for (notice of notices; track notice.id) {
                  <mat-card class="notice-card" [class]="'priority-' + notice.priority">
                    <div class="notice-header">
                      <div class="notice-title-section">
                        <h2 class="notice-title">{{ notice.title }}</h2>
                        <mat-chip-set>
                          <mat-chip [class]="'priority-' + notice.priority">
                            <mat-icon>{{ getPriorityIcon(notice.priority) }}</mat-icon>
                            {{ notice.priority | titlecase }}
                          </mat-chip>
                          @if (notice.category) {
                            <mat-chip class="category-chip">{{ notice.category | titlecase }}</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                      <div class="notice-meta">
                        <span class="notice-date">
                          <mat-icon>schedule</mat-icon>
                          {{ notice.created_at | date:'dd MMM yyyy, HH:mm' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="notice-content">
                      <p>{{ notice.content }}</p>
                    </div>
                    
                    <div class="notice-footer">
                      <div class="notice-author">
                        <mat-icon>person</mat-icon>
                        <span>Posted by Admin</span>
                      </div>
                      <div class="notice-actions">
                        <button mat-stroked-button class="bookmark-btn">
                          <mat-icon>bookmark_border</mat-icon>
                          Bookmark
                        </button>
                      </div>
                    </div>
                  </mat-card>
                }
              </div>
            </div>
          </mat-tab>

          <mat-tab label="High Priority">
            <div class="tab-content">
              <div class="notices-list">
                @for (notice of getHighPriorityNotices(); track notice.id) {
                  <mat-card class="notice-card priority-high">
                    <div class="notice-header">
                      <div class="notice-title-section">
                        <h2 class="notice-title">{{ notice.title }}</h2>
                        <mat-chip-set>
                          <mat-chip class="priority-high">
                            <mat-icon>priority_high</mat-icon>
                            High Priority
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                      <div class="notice-meta">
                        <span class="notice-date">
                          <mat-icon>schedule</mat-icon>
                          {{ notice.created_at | date:'dd MMM yyyy, HH:mm' }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="notice-content">
                      <p>{{ notice.content }}</p>
                    </div>
                    
                    <div class="notice-footer">
                      <div class="notice-author">
                        <mat-icon>person</mat-icon>
                        <span>Posted by Admin</span>
                      </div>
                    </div>
                  </mat-card>
                }
                @if (getHighPriorityNotices().length === 0) {
                  <div class="empty-state">
                    <mat-icon>priority_high</mat-icon>
                    <h3>No High Priority Notices</h3>
                    <p>There are currently no high priority notices.</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      }

      @if (!loading && notices.length === 0) {
        <mat-card class="empty-notices-card">
          <div class="empty-state">
            <mat-icon>campaign</mat-icon>
            <h3>No Notices Available</h3>
            <p>There are currently no notices or announcements.</p>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .notices { max-width: 1200px; padding: 0 16px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 24px; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: var(--card-bg); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--border-color); }
    .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; mat-icon { font-size: 24px; width: 24px; height: 24px; } }
    .card-content { display: flex; flex-direction: column; }
    .card-value { font-size: 20px; font-weight: 700; color: var(--text-main); }
    .card-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .notice-tabs { margin-bottom: 16px; }
    .tab-content { padding-top: 16px; }
    .notices-list { display: flex; flex-direction: column; gap: 16px; }
    .notice-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 24px !important;
      transition: all 0.2s;
      &.priority-high { border-left: 4px solid #dc2626 !important; }
      &.priority-normal { border-left: 4px solid #0284c7 !important; }
      &.priority-low { border-left: 4px solid #059669 !important; }
    }
    .notice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .notice-title { font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0 0 12px; }
    .notice-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .notice-date { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .notice-content { margin-bottom: 20px; p { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin: 0; } }
    .notice-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-color); }
    .notice-author { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    .priority-high { background: var(--badge-danger-bg) !important; color: var(--badge-danger-text) !important; }
    .priority-normal { background: var(--badge-info-bg) !important; color: var(--badge-info-text) !important; }
    .priority-low { background: var(--badge-success-bg) !important; color: var(--badge-success-text) !important; }
    .category-chip { background: var(--surface-2) !important; color: var(--text-muted) !important; }
    .empty-notices-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 60px 40px !important; }
    .empty-state { text-align: center; color: var(--text-muted); mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; } h3 { font-size: 18px; color: var(--text-main); margin: 0 0 8px; } p { font-size: 14px; margin: 0; } }
    @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } }
  `],
})
export class HostelerNoticesComponent implements OnInit {
  notices: any[] = [];
  loading = true;
  private noticeService = inject(NoticeService);

  ngOnInit() {
    this.loadNotices();
  }

  loadNotices() {
    this.loading = true;
    this.noticeService.getAllNotices().subscribe({
      next: (data) => {
        this.notices = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading notices', err);
        this.loading = false;
      }
    });
  }

  getHighPriorityCount(): number {
    return this.notices.filter(notice => notice.priority === 'high').length;
  }

  getRecentCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.notices.filter(notice => new Date(notice.created_at) > oneWeekAgo).length;
  }

  getHighPriorityNotices(): any[] {
    return this.notices.filter(notice => notice.priority === 'high');
  }

  getRecentNotices(): any[] {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.notices.filter(notice => new Date(notice.created_at) > oneWeekAgo);
  }

  getPriorityIcon(priority: string): string {
    const iconMap: { [key: string]: string } = {
      'high': 'priority_high',
      'medium': 'info',
      'low': 'low_priority'
    };
    return iconMap[priority] || 'info';
  }
}