import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'primary' | 'accent' | 'warn';
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <div class="confirm-container">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button class="cancel-btn" (click)="onCancel()">{{ data.cancelText || 'Cancel' }}</button>
        <button mat-flat-button class="confirm-btn" [color]="data.color || 'primary'" (click)="onConfirm()">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
    styles: [`
    .confirm-container {
      padding: 12px 6px; border-radius: 16px;
      background: var(--card-bg);
    }
    h2 { 
      margin: 0; font-size: 20px; font-weight: 700; 
      color: var(--text-main); letter-spacing: -0.5px;
    }
    .message { 
      color: var(--text-muted); line-height: 1.6; 
      font-size: 14px; margin-top: 12px;
    }
    mat-dialog-actions { padding: 24px 0 0; gap: 8px; }
    .cancel-btn { color: var(--text-muted) !important; font-weight: 500; }
    .confirm-btn { border-radius: 8px !important; font-weight: 600; padding: 0 20px !important; }
  `],
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
