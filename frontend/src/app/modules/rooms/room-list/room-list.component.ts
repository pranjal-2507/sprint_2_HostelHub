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
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoomFormDialogComponent } from '../room-form-dialog/room-form-dialog.component';
import { Room } from '../../../core/models';
import { RoomService } from '../../../core/services/room.service';
import { RoomService } from '../../../core/services';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule,
    MatFormFieldModule, MatSnackBarModule, MatTooltipModule, SearchFilterComponent, StatusBadgePipe,
  ],
  template: `
    <div class="rooms-page">
      <div class="page-header">
        <h1 class="page-title">Manage Rooms</h1>
        <button mat-flat-button class="primary-btn" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Room
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading rooms...</p>
        </div>

      } @else {
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
                <mat-option value="reserved">Reserved</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="roomNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Room</th>
              <td mat-cell *matCellDef="let room"><strong>{{ room.room_number }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="floor">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Floor</th>
              <td mat-cell *matCellDef="let room">{{ room.floor }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let room">{{ room.room_type | titlecase }}</td>
            </ng-container>
            <ng-container matColumnDef="capacity">
              <th mat-header-cell *matHeaderCellDef>Capacity</th>
              <td mat-cell *matCellDef="let room">{{ room.capacity }}</td>
            </ng-container>
            <ng-container matColumnDef="occupancy">
              <th mat-header-cell *matHeaderCellDef>Occupied</th>
              <td mat-cell *matCellDef="let room">{{ room.occupancy || 0 }}/{{ room.capacity }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let room">
                <span class="badge" [ngClass]="room.status | statusBadge">{{ room.status | titlecase }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Rent</th>
              <td mat-cell *matCellDef="let room">₹{{ room.rent | number }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let room">
                <button mat-icon-button (click)="openEditDialog(room)" matTooltip="Edit">
                  <mat-icon class="action-icon edit">edit</mat-icon>
                </button>
                <button mat-icon-button (click)="deleteRoom(room)" matTooltip="Delete">
                  <mat-icon class="action-icon delete">delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
        </mat-card>
      }
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
    .rooms-page { max-width: 1200px; padding: 0 16px; }
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
    .action-icon { font-size: 20px; }
    .action-icon.edit { color: #4f46e5; }
    .action-icon.delete { color: #dc2626; }
    @media (max-width: 768px) { .page-header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `],
})
export class RoomListComponent implements OnInit {
  displayedColumns = ['roomNumber', 'floor', 'type', 'capacity', 'occupancy', 'status', 'price', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  loading = true;
  private roomService = inject(RoomService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allRooms: any[] = [];

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.loading = true;
    this.roomService.getAll().subscribe({
      next: (data) => {
        this.allRooms = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching rooms', err);
        this.loading = false;
      }
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
    this.dataSource.data = s ? this.allRooms.filter(r => r.status === s) : this.allRooms;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(RoomFormDialogComponent, { width: '520px', data: {} });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.create(result).subscribe({
          next: () => {
            this.fetchRooms();
            this.snackBar.open('Room added successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error adding room', err);
            this.snackBar.open('Failed to add room', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  openEditDialog(room: any): void {
    const dialogRef = this.dialog.open(RoomFormDialogComponent, { width: '520px', data: { room } });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update logic here if service supports it
        this.fetchRooms();
        this.snackBar.open('Room updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteRoom(room: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Delete Room', message: `Are you sure you want to delete room ${room.room_number}?`, confirmText: 'Delete', color: 'warn' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.roomService.delete(room.id).subscribe({
          next: () => {
            this.fetchRooms();
            this.snackBar.open('Room deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error deleting room', err);
            this.snackBar.open('Failed to delete room', 'Close', { duration: 3000 });
          }
        });
      }
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
