import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { Visitor } from '../../../core/models';
import { VisitorService } from '../../../core/services';

@Component({
  selector: 'app-visitor-log-table',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, SearchFilterComponent, StatusBadgePipe],
  template: `
    <mat-card class="table-card">
      <div class="toolbar">
        <app-search-filter placeholder="Search visitors..." (searchChange)="applySearch($event)"></app-search-filter>
      </div>
      <table mat-table [dataSource]="dataSource" matSort>
        <ng-container matColumnDef="visitorName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Visitor</th>
          <td mat-cell *matCellDef="let v"><strong>{{ v.visitorName }}</strong></td>
        </ng-container>
        <ng-container matColumnDef="visitorPhone">
          <th mat-header-cell *matHeaderCellDef>Phone</th>
          <td mat-cell *matCellDef="let v">{{ v.visitorPhone }}</td>
        </ng-container>
        <ng-container matColumnDef="visitingStudent">
          <th mat-header-cell *matHeaderCellDef>Visiting</th>
          <td mat-cell *matCellDef="let v">{{ v.visitingStudent }}</td>
        </ng-container>
        <ng-container matColumnDef="roomNumber">
          <th mat-header-cell *matHeaderCellDef>Room</th>
          <td mat-cell *matCellDef="let v">{{ v.roomNumber }}</td>
        </ng-container>
        <ng-container matColumnDef="checkInTime">
          <th mat-header-cell *matHeaderCellDef>Check-in</th>
          <td mat-cell *matCellDef="let v">{{ v.checkInTime | date:'shortTime' }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let v">
            <span class="badge" [ngClass]="v.status | statusBadge">{{ v.status | titlecase }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let v">
            <button mat-flat-button class="checkout-btn" *ngIf="v.status === 'checked-in'" (click)="checkOut(v)">Check Out</button>
            <span *ngIf="v.status === 'checked-out'" class="muted">{{ v.checkOutTime | date:'shortTime' }}</span>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
    </mat-card>
  `,
  styles: [`
    .table-card { background: #fff !important; border: 1px solid #f1f5f9; border-radius: 12px !important; padding: 0 !important; }
    .toolbar { padding: 16px 20px; }
    table { width: 100%; }
    strong { color: #1e293b; }
    .badge { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
    .checkout-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 6px !important; font-size: 12px; height: 32px; }
    .muted { color: #94a3b8; font-size: 12px; }
  `],
})
export class VisitorLogTableComponent implements OnInit {
  displayedColumns = ['visitorName', 'visitorPhone', 'visitingStudent', 'roomNumber', 'checkInTime', 'status', 'actions'];
  dataSource = new MatTableDataSource<Visitor>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private snackBar: MatSnackBar,
    private visitorService: VisitorService
  ) { }

  ngOnInit(): void {
    this.loadVisitors();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadVisitors(): void {
    this.visitorService.getAll().subscribe({
      next: (visitors) => {
        this.dataSource.data = visitors;
      },
      error: (err) => console.error('Error loading visitors', err)
    });
  }

  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  checkOut(visitor: Visitor): void {
    const updated = { ...visitor, status: 'checked-out' as 'checked-out', checkOutTime: new Date().toISOString() };
    this.visitorService.update(visitor.id, updated).subscribe({
      next: () => {
        this.snackBar.open(`${visitor.visitorName} checked out`, 'OK', { duration: 3000 });
        this.loadVisitors();
      },
      error: (err) => console.error('Error checking out visitor', err)
    });
  }
}
