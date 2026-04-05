import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';

@Component({
  selector: 'app-my-room',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <div class="my-room">
      <h1 class="page-title">My Room</h1>

      @if (loading) {
        <div class="loading-state">
          <p>Loading room details...</p>
        </div>
      } @else if (roomInfo) {
        <div class="room-cards">
          <!-- Room Details Card -->
          <mat-card class="room-card">
            <div class="card-header">
              <h2 class="card-title">
                <mat-icon>meeting_room</mat-icon>
                Room Details
              </h2>
            </div>
            <div class="room-info">
              <div class="info-grid">
                <div class="info-item">
                  <mat-icon class="info-icon">door_front</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Room Number</span>
                    <span class="info-value">{{ roomInfo.room_number }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">layers</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Floor</span>
                    <span class="info-value">{{ roomInfo.floor }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">people</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Capacity</span>
                    <span class="info-value">{{ roomInfo.capacity }} Students</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">person</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Occupied</span>
                    <span class="info-value">{{ roomInfo.occupancy }} Students</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">home</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Room Type</span>
                    <span class="info-value">{{ roomInfo.room_type | titlecase }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <mat-icon class="info-icon">payments</mat-icon>
                  <div class="info-content">
                    <span class="info-label">Monthly Rent</span>
                    <span class="info-value">₹{{ roomInfo.price_per_month | number }}</span>
                  </div>
                </div>
              </div>
              <div class="status-section">
                <span class="status-label">Room Status:</span>
                <mat-chip-set>
                  <mat-chip [class]="'status-' + roomInfo.status">{{ roomInfo.status | titlecase }}</mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </mat-card>

          <!-- Occupancy Information -->
          <mat-card class="occupancy-card">
            <div class="card-header">
              <h2 class="card-title">
                <mat-icon>group</mat-icon>
                Occupancy Information
              </h2>
            </div>
            <div class="occupancy-info">
              <div class="occupancy-visual">
                <div class="occupancy-circle">
                  <div class="occupancy-fill" [style.height.%]="getOccupancyPercentage()"></div>
                  <div class="occupancy-text">
                    <span class="occupancy-number">{{ roomInfo.occupancy }}/{{ roomInfo.capacity }}</span>
                    <span class="occupancy-label">Occupied</span>
                  </div>
                </div>
              </div>
              <div class="occupancy-details">
                <div class="detail-item">
                  <span class="detail-label">Available Beds</span>
                  <span class="detail-value">{{ roomInfo.capacity - roomInfo.occupancy }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Occupancy Rate</span>
                  <span class="detail-value">{{ getOccupancyPercentage() }}%</span>
                </div>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Room Amenities -->
        <mat-card class="amenities-card">
          <h2 class="card-title mb-4"><mat-icon>star</mat-icon> Standard Amenities</h2>
          <div class="amenities-grid">
            @for (a of roomAmenities; track a.name) {
              <div class="amenity-item" [class.available]="a.available">
                <mat-icon>{{ a.icon }}</mat-icon>
                <span>{{ a.name }}</span>
                <mat-icon class="check-icon" *ngIf="a.available">check_circle</mat-icon>
              </div>
            }
          </div>
        </mat-card>
      } @else {
        <mat-card class="no-room-card">
          <div class="no-room-content">
            <mat-icon class="no-room-icon">home</mat-icon>
            <h2>No Room Assigned</h2>
            <p>You haven't been assigned a room yet. Please contact the administration.</p>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .my-room { max-width: 1200px; padding: 0 16px; margin: 0 auto; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 24px; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .room-cards { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
    .room-card, .occupancy-card, .amenities-card, .no-room-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 24px !important;
    }
    .card-header { margin-bottom: 20px; }
    .card-title { font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .info-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--surface-2); border-radius: 8px; }
    .info-icon { color: #4f46e5; font-size: 20px; width: 20px; height: 20px; }
    .info-content { display: flex; flex-direction: column; }
    .info-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
    .info-value { font-size: 14px; color: var(--text-main); font-weight: 600; margin-top: 2px; }
    .status-section { display: flex; align-items: center; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border-color); }
    .status-label { font-size: 13px; color: var(--text-muted); }
    .occupancy-info { display: flex; flex-direction: column; align-items: center; gap: 24px; }
    .occupancy-circle {
      width: 120px; height: 120px; border-radius: 50%; border: 6px solid var(--surface-2);
      position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
    }
    .occupancy-fill { position: absolute; bottom: 0; left: 0; right: 0; background: #4f46e5; opacity: 0.15; transition: height 0.5s ease; }
    .occupancy-text { z-index: 1; text-align: center; }
    .occupancy-number { font-size: 20px; font-weight: 700; color: var(--text-main); display: block; }
    .occupancy-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
    .occupancy-details { width: 100%; }
    .detail-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
    .amenities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .amenity-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-2); font-size: 13px; }
    .check-icon { margin-left: auto; color: #059669; font-size: 18px; width: 18px; height: 18px; }
    .no-room-card { text-align: center; padding: 60px !important; }
    .no-room-icon { font-size: 48px; width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px; }
    @media (max-width: 900px) { .room-cards { grid-template-columns: 1fr; } }
  `],
})
export class MyRoomComponent implements OnInit {
  roomInfo: any = null;
  loading = false;
  private roomService = inject(RoomService);
  private route = inject(ActivatedRoute);

  roomAmenities = [
    { name: 'Wi-Fi Internet', icon: 'wifi', available: true },
    { name: 'Study Table', icon: 'desk', available: true },
    { name: 'Wardrobe', icon: 'checkroom', available: true },
    { name: 'Ceiling Fan', icon: 'fan', available: true },
  ];

  ngOnInit() {
    // 1. Get initial data from resolver (Pre-fetched)
    this.roomInfo = this.route.snapshot.data['roomInfo'];
    
    // 2. Fallback if resolver didn't provide data
    if (!this.roomInfo) {
      this.loadRoomInfo();
    }
  }

  loadRoomInfo() {
    this.loading = true;
    this.roomService.getHostelerRoomInfo().subscribe({
      next: (data) => {
        this.roomInfo = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading room info', err);
        this.loading = false;
      }
    });
  }

  getOccupancyPercentage(): number {
    if (!this.roomInfo) return 0;
    const occ = this.roomInfo.occupied || this.roomInfo.occupancy || 0;
    return Math.round((occ / this.roomInfo.capacity) * 100);
  }
}