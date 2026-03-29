import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { Room } from '../../../core/models';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatListModule, MatButtonModule, StatusBadgePipe],
  template: `
    <mat-card class="room-detail-card" *ngIf="room">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>meeting_room</mat-icon>
          Room {{ room.room_number }}
        </mat-card-title>
        <span class="status-badge" [ngClass]="room.status | statusBadge">{{ room.status | titlecase }}</span>
      </mat-card-header>
      <mat-card-content>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">Floor</span>
            <span class="value">{{ room.floor }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Type</span>
            <span class="value">{{ room.room_type | titlecase }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Capacity</span>
            <span class="value">{{ room.occupancy || 0 }}/{{ room.capacity }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Price/Month</span>
            <span class="value">₹{{ room.rent | number }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .room-detail-card {
      background: #111d32 !important;
      border: 1px solid rgba(148, 163, 184, 0.06);
      border-radius: 16px !important;
    }
    mat-card-header {
      display: flex; justify-content: space-between; align-items: center;
    }
    .detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;
    }
    .detail-item {
      display: flex; flex-direction: column; gap: 4px;
      .label { font-size: 12px; color: rgba(148, 163, 184, 0.5); text-transform: uppercase; }
      .value { font-size: 16px; font-weight: 600; color: #f1f5f9; }
    }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
  `],
})
export class RoomDetailsComponent {
  @Input() room!: Room;
}
