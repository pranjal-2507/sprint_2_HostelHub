import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { Payment } from '../../../core/models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule, MatIconModule],
  template: `
    <div class="payment-history">
      <div class="page-header">
        <h1>Payment History</h1>
        <p class="subtitle">Complete record of all fee payments</p>
      </div>

      <mat-card class="table-card">
        <table mat-table [dataSource]="dataSource" class="payment-table">
          <ng-container matColumnDef="paymentDate">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let p">{{ p.paymentDate }}</td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let p" class="amount">₹{{ p.amount | number }}</td>
          </ng-container>
          <ng-container matColumnDef="paymentMethod">
            <th mat-header-cell *matHeaderCellDef>Method</th>
            <td mat-cell *matCellDef="let p">
              <span class="method-chip">{{ p.paymentMethod | uppercase }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="transactionId">
            <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
            <td mat-cell *matCellDef="let p" class="txn-id">{{ p.transactionId || '—' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-history { max-width: 1400px; margin: 0 auto; }
    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
      .subtitle { color: rgba(148, 163, 184, 0.6); margin: 0; font-size: 14px; }
    }
    .table-card {
      background: #111d32 !important; border: 1px solid rgba(148, 163, 184, 0.06);
      border-radius: 16px !important;
    }
    .payment-table { width: 100%; }
    .amount { color: #34d399; font-weight: 600; }
    .method-chip {
      background: rgba(0, 212, 170, 0.08); color: #5eead4;
      padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
    }
    .txn-id { font-family: monospace; color: rgba(148, 163, 184, 0.5); font-size: 12px; }
    .table-row:hover { background: rgba(0, 212, 170, 0.03); }
  `],
})
export class PaymentHistoryComponent implements OnInit {
  displayedColumns = ['paymentDate', 'amount', 'paymentMethod', 'transactionId'];
  dataSource = new MatTableDataSource<Payment>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  mockPayments: Payment[] = [
    { id: 'p1', feeId: 'f1', amount: 12000, paymentDate: '2024-01-15', paymentMethod: 'upi', transactionId: 'UPI2024011512345' },
    { id: 'p2', feeId: 'f1', amount: 12000, paymentDate: '2024-02-15', paymentMethod: 'online', transactionId: 'TXN2024021567890' },
    { id: 'p3', feeId: 'f1', amount: 12000, paymentDate: '2024-03-15', paymentMethod: 'cash' },
    { id: 'p4', feeId: 'f2', amount: 12000, paymentDate: '2024-01-10', paymentMethod: 'upi', transactionId: 'UPI2024011098765' },
    { id: 'p5', feeId: 'f2', amount: 12000, paymentDate: '2024-02-10', paymentMethod: 'cheque', transactionId: 'CHQ001234' },
  ];

  ngOnInit(): void { this.dataSource.data = this.mockPayments; }
  ngAfterViewInit(): void { this.dataSource.paginator = this.paginator; }
}
