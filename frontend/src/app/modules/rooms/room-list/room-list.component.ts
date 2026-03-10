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
              <button mat-icon-button><mat-icon class="action-icon">visibility</mat-icon></button>
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

  mockRooms: Room[] = [
    { id: '1', hostelId: 'h1', roomNumber: '101', floor: 1, capacity: 2, occupancy: 1, type: 'double', status: 'available', amenities: ['Wi-Fi', 'AC'], pricePerMonth: 8000, allocatedStudents: ['s1'], createdAt: '', updatedAt: '' },
    { id: '2', hostelId: 'h1', roomNumber: '102', floor: 1, capacity: 1, occupancy: 1, type: 'single', status: 'occupied', amenities: ['Wi-Fi'], pricePerMonth: 6000, allocatedStudents: ['s2'], createdAt: '', updatedAt: '' },
    { id: '3', hostelId: 'h1', roomNumber: '201', floor: 2, capacity: 3, occupancy: 2, type: 'triple', status: 'available', amenities: ['Wi-Fi', 'Fan'], pricePerMonth: 5000, allocatedStudents: [], createdAt: '', updatedAt: '' },
    { id: '4', hostelId: 'h1', roomNumber: '202', floor: 2, capacity: 2, occupancy: 2, type: 'double', status: 'occupied', amenities: ['Wi-Fi', 'AC'], pricePerMonth: 8000, allocatedStudents: [], createdAt: '', updatedAt: '' },
    { id: '5', hostelId: 'h1', roomNumber: '301', floor: 3, capacity: 1, occupancy: 0, type: 'single', status: 'maintenance', amenities: ['Wi-Fi'], pricePerMonth: 6000, allocatedStudents: [], createdAt: '', updatedAt: '' },
    { id: '6', hostelId: 'h1', roomNumber: '302', floor: 3, capacity: 4, occupancy: 0, type: 'dormitory', status: 'available', amenities: ['Fan'], pricePerMonth: 3500, allocatedStudents: [], createdAt: '', updatedAt: '' },
    { id: '7', hostelId: 'h1', roomNumber: '303', floor: 3, capacity: 2, occupancy: 1, type: 'double', status: 'reserved', amenities: ['Wi-Fi', 'AC'], pricePerMonth: 8000, allocatedStudents: [], createdAt: '', updatedAt: '' },
    { id: '8', hostelId: 'h1', roomNumber: '401', floor: 4, capacity: 3, occupancy: 3, type: 'triple', status: 'occupied', amenities: ['Wi-Fi', 'Fan'], pricePerMonth: 5000, allocatedStudents: [], createdAt: '', updatedAt: '' },
  ];

  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { this.dataSource.data = this.mockRooms; }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; this.dataSource.sort = this.sort; }
  applySearch(v: string): void { this.dataSource.filter = v.trim().toLowerCase(); }
  filterByStatus(s: string): void { this.dataSource.data = s ? this.mockRooms.filter(r => r.status === s) : this.mockRooms; }
  openAllocationDialog(): void { this.dialog.open(RoomAllocationFormComponent, { width: '480px', data: { rooms: this.mockRooms.filter(r => r.status === 'available') } }); }
}
