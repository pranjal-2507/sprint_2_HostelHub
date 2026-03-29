import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { Visitor } from '../../../core/models';
import { VisitorService } from '../../../core/services';

@Component({
  selector: 'app-visitor-log-table',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCardModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule, MatFormFieldModule,
    MatSelectModule, SearchFilterComponent,
  ],
  template: `
    <div class="visitor-log-page">
      <div class="page-header">
        <h1 class="page-title">Visitor Registry</h1>
        <button mat-flat-button class="primary-btn">
          <mat-icon>add</mat-icon> Log Visitor
        </button>
      </div>

      <mat-card class="table-card">
        <div class="toolbar">
          <app-search-filter placeholder="Search logs..." (searchChange)="applySearch($event)"></app-search-filter>
        </div>

        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="visitorName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Visitor</th>
            <td mat-cell *matCellDef="let v">
              <div class="visitor-info">
                <span class="v-name">{{ v.visitorName }}</span>
                <span class="v-phone">{{ v.visitorPhone }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="visitingStudent">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Visiting Student</th>
            <td mat-cell *matCellDef="let v">{{ v.visitingStudent }}</td>
          </ng-container>

          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Room</th>
            <td mat-cell *matCellDef="let v">{{ v.roomNumber }}</td>
          </ng-container>

          <ng-container matColumnDef="checkInTime">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Check In</th>
            <td mat-cell *matCellDef="let v">{{ v.checkInTime }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let v">
              <span class="badge" [ngClass]="v.status === 'checked-in' ? 'badge-in' : 'badge-out'">
                {{ v.status | uppercase }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let v">
              @if (v.status === 'checked-in') {
                <button mat-stroked-button class="checkout-btn">Checkout</button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        @if (dataSource.data.length === 0) {
          <div class="empty-state">
            <mat-icon>assignment_ind</mat-icon>
            <p>No visitor logs found</p>
          </div>
        }
        
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
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
    .visitor-log-page { max-width: 1200px; padding: 0 16px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
    .table-card { background: var(--card-bg) !important; border: 1px solid var(--border-color); border-radius: 12px !important; padding: 0 !important; }
    .toolbar { padding: 16px 20px; }
    table { width: 100%; background: transparent !important; }
    .visitor-info { display: flex; flex-direction: column; }
    .v-name { font-weight: 600; color: var(--text-main); }
    .v-phone { font-size: 11px; color: var(--text-muted); }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; }
    .badge-in { background: #ecfdf5; color: #059669; }
    .badge-out { background: rgba(148, 163, 184, 0.08); color: var(--text-muted); }
    .checkout-btn { font-size: 12px !important; height: 32px !important; line-height: 32px !important; padding: 0 12px !important; }
    .empty-state { text-align: center; padding: 70px 20px; color: var(--text-muted); mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; } p { font-size: 14px; margin-top: 8px; } }
  `],
})
export class VisitorLogTableComponent implements OnInit {
  displayedColumns = ['visitorName', 'visitingStudent', 'roomNumber', 'checkInTime', 'status', 'actions'];
  dataSource = new MatTableDataSource<Visitor>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void { this.dataSource.data = []; }
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


  applySearch(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();

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
