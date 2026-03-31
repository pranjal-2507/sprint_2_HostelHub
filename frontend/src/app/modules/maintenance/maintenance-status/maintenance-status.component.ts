import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { MaintenanceRequest } from '../../../core/models';

@Component({
  selector: 'app-maintenance-status',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, StatusBadgePipe],
  template: `
    <mat-card class="status-card" *ngIf="request">
      <mat-card-header>
        <mat-card-title>{{ request.title }}</mat-card-title>
        <span class="status-badge" [ngClass]="request.status | statusBadge">{{ request.status | titlecase }}</span>
      </mat-card-header>
      <mat-card-content>
        <div class="timeline">
          <div class="timeline-item completed">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">Request Submitted</span>
              <span class="timeline-date">{{ request.created_at | date:'medium' }}</span>
            </div>
          </div>
          <div class="timeline-item" [class.completed]="request.status !== 'pending'">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">Investigation & Progress</span>
              <span class="timeline-date">Status: {{ request.status | titlecase }}</span>
            </div>
          </div>
          <div class="timeline-item" [class.completed]="request.status === 'resolved'">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">Resolution</span>
              <span class="timeline-date" *ngIf="request.status === 'resolved'">Request marked as completed</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .status-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 16px !important;
    }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .timeline { padding: 16px; }
    .timeline-item {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 12px 0; position: relative;
      &:not(:last-child)::after {
        content: ''; position: absolute; left: 7px; top: 28px;
        width: 2px; height: calc(100% - 16px); background: var(--border-color);
      }
      &.completed .timeline-dot { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
      &.completed::after { background: #10b981 !important; }
    }
    .timeline-dot {
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--border-color); flex-shrink: 0; margin-top: 2px;
    }
    .timeline-content { display: flex; flex-direction: column; gap: 2px; }
    .timeline-label { color: var(--text-main); font-weight: 600; font-size: 14px; }
    .timeline-date { color: var(--text-muted); font-size: 12px; }
  `],
})
export class MaintenanceStatusComponent {
  @Input() request!: MaintenanceRequest;
}
