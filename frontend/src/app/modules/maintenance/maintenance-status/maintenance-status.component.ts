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
              <span class="timeline-date">{{ request.createdAt }}</span>
            </div>
          </div>
          <div class="timeline-item" [class.completed]="request.status !== 'pending'">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">In Progress</span>
              <span class="timeline-date" *ngIf="request.assignedTo">Assigned to {{ request.assignedTo }}</span>
            </div>
          </div>
          <div class="timeline-item" [class.completed]="request.status === 'resolved'">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">Resolved</span>
              <span class="timeline-date" *ngIf="request.resolvedAt">{{ request.resolvedAt }}</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .status-card {
      background: #111d32 !important; border: 1px solid rgba(148, 163, 184, 0.06);
      border-radius: 16px !important;
    }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .badge-success { background: rgba(16, 185, 129, 0.12); color: #34d399; }
    .badge-info { background: rgba(56, 189, 248, 0.12); color: #38bdf8; }
    .badge-warning { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
    .badge-danger { background: rgba(244, 63, 94, 0.12); color: #fb7185; }
    .timeline { padding: 16px 0; }
    .timeline-item {
      display: flex; align-items: flex-start; gap: 16px;
      padding: 12px 0; position: relative;
      &:not(:last-child)::after {
        content: ''; position: absolute; left: 7px; top: 28px;
        width: 2px; height: calc(100% - 16px); background: rgba(148, 163, 184, 0.1);
      }
      &.completed .timeline-dot { background: #00d4aa; box-shadow: 0 0 8px rgba(0, 212, 170, 0.3); }
      &.completed::after { background: #00d4aa !important; }
    }
    .timeline-dot {
      width: 16px; height: 16px; border-radius: 50%;
      background: rgba(148, 163, 184, 0.15); flex-shrink: 0; margin-top: 2px;
    }
    .timeline-content { display: flex; flex-direction: column; gap: 2px; }
    .timeline-label { color: #f1f5f9; font-weight: 500; font-size: 14px; }
    .timeline-date { color: rgba(148, 163, 184, 0.5); font-size: 12px; }
  `],
})
export class MaintenanceStatusComponent {
  @Input() request!: MaintenanceRequest;
}
