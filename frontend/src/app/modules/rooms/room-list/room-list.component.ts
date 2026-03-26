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
import { RoomAllocationFormComponent } from '../room-allocation-form/room-allocation-form.component';
import { Room } from '../../../core/models';
import { RoomService } from '../../../core/services';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, SearchFilterComponent, StatusBadgePipe,
  ],
  template: `
    <div class="rooms-page">
      <div class="page-header">
        <h1 class="page-title">Room Management</h1>
        <button mat-flat-button class="primary-btn" (click)="openAllocationDialog()">
          <mat-icon>add</mat-icon> Allocate Room
        </button>
      </div>

      <mat-card class="table-card">
        <div class="toolbar">
          <app-search-filter placeholder="Search rooms..." (searchChange)="applySearch($event)"></app-search-filter>
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select (selectionChange)="filterByStatus($event.value)">
              <mat-option value="">All</mat-option>
              <mat-option value="available">Available</mat-option>
              <mat-option value="occupied">Occupied</mat-option>
              <mat-option value="maintenance">Maintenance</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Room</th>
            <td mat-cell *matCellDef="let room"><strong>{{ room.roomNumber }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="floor">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Floor</th>
            <td mat-cell *matCellDef="let room">{{ room.floor }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
            <td mat-cell *matCellDef="let room">{{ room.type | titlecase }}</td>
          </ng-container>
          <ng-container matColumnDef="capacity">
            <th mat-header-cell *matHeaderCellDef>Occupancy</th>
            <td mat-cell *matCellDef="let room">{{ room.occupancy }}/{{ room.capacity }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let room">
              <span class="badge" [ngClass]="room.status | statusBadge">{{ room.status | titlecase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
            <td mat-cell *matCellDef="let room">₹{{ room.pricePerMonth | number }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let room">
              <button mat-icon-button (click)="viewRoom(room)"><mat-icon class="action-icon">visibility</mat-icon></button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .rooms-page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0; }
    .primary-btn {
      background: #4f46e5 !important; color: #fff !important;
      border-radius: 8px !important; font-weight: 500; height: 40px;
    }
    .table-card {
      background: #fff !important; border: 1px solid #f1f5f9;
      border-radius: 12px !important; padding: 0 !important;
    }
    .toolbar { display: flex; gap: 12px; align-items: center; padding: 16px 20px; flex-wrap: wrap; }
    .filter-field { max-width: 160px; }
    table { width: 100%; }
    strong { color: #1e293b; }
    .badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .action-icon { color: #94a3b8; font-size: 20px; }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `],
})
export class RoomListComponent implements OnInit {
  displayedColumns = ['roomNumber', 'floor', 'type', 'capacity', 'status', 'price', 'actions'];
  dataSource = new MatTableDataSource<Room>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadRooms(status?: string): void {
    this.roomService.getAll({ status }).subscribe({
      next: (rooms) => {
        this.dataSource.data = rooms;
      },
      error: (err) => console.error('Error loading rooms', err)
    });
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  filterByStatus(s: string): void {
    this.loadRooms(s || undefined);
  }

  viewRoom(room: Room): void {
    // Implement view logic or navigation
    console.log('Viewing room', room);
  }

  openAllocationDialog(): void {
    const availableRooms = this.dataSource.data.filter(r => r.status === 'available');
    this.dialog.open(RoomAllocationFormComponent, { 
      width: '480px', 
      data: { rooms: availableRooms } 
    });
  }
}
