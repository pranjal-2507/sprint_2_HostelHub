import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Payment } from '../../../core/models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="payment-history">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payment History</h1>
          <p class="subtitle">Complete record of all fee payments</p>
        </div>
        <a mat-stroked-button routerLink="/fees" class="back-btn">
          <mat-icon>arrow_back</mat-icon> Back to Fees
        </a>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource" class="payment-table">
          <ng-container matColumnDef="paymentDate">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.payment_date | date }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let p" class="amount">₹{{ p.amount | number }}</td>
          </ng-container>
          <ng-container matColumnDef="paymentMethod">
            <th mat-header-cell *matHeaderCellDef>Method</th>
            <td mat-cell *matCellDef="let p">
              <span class="method-chip">{{ p.payment_method | uppercase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="transactionId">
            <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
            <td mat-cell *matCellDef="let p" class="txn-id">{{ p.transaction_id || '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        @if (dataSource.data.length === 0) {
          <div class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p>No payment history found</p>
          </div>
        }
        
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-history { max-width: 1200px; padding: 0 16px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;
    }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 4px; }
    .subtitle { color: var(--text-muted); margin: 0; font-size: 14px; }
    .back-btn { border-color: var(--border-color) !important; color: #4f46e5 !important; border-radius: 8px !important; }
    .table-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 0 !important;
    }
    .payment-table { width: 100%; background: transparent !important; }
    .amount { color: #059669; font-weight: 600; }
    .method-chip {
      background: #eef2ff; color: #4f46e5;
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .txn-id { font-family: monospace; color: var(--text-muted); font-size: 12px; }
    .empty-state {
      text-align: center; padding: 48px; color: var(--text-muted);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.5; }
    }
  `],
})
export class PaymentHistoryComponent implements OnInit {
  displayedColumns = ['paymentDate', 'amount', 'paymentMethod', 'transactionId'];
  dataSource = new MatTableDataSource<Payment>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void { 
    // Data will be loaded from service in future integration
    this.dataSource.data = []; 
  }
  
  ngAfterViewInit(): void { 
    this.dataSource.paginator = this.paginator; 
  }
}
