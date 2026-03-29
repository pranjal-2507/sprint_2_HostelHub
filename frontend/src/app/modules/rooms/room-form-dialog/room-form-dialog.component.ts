import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Room } from '../../../core/models';

@Component({
  selector: 'app-room-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.room ? 'Edit Room' : 'Add Room' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Room Number</mat-label>
          <input matInput formControlName="room_number" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Floor</mat-label>
          <input matInput type="number" formControlName="floor" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Type</mat-label>
          <mat-select formControlName="room_type">
            <mat-option value="single">Single</mat-option>
            <mat-option value="double">Double</mat-option>
            <mat-option value="triple">Triple</mat-option>
            <mat-option value="dormitory">Dormitory</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Capacity</mat-label>
          <input matInput type="number" formControlName="capacity" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Rent / Month (₹)</mat-label>
          <input matInput type="number" formControlName="rent" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="available">Available</mat-option>
            <mat-option value="occupied">Occupied</mat-option>
            <mat-option value="maintenance">Maintenance</mat-option>
            <mat-option value="reserved">Reserved</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button class="primary-btn" [disabled]="form.invalid" (click)="onSave()">
        {{ data.room ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;
      min-width: 400px;
    }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
  `],
})
export class RoomFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoomFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { room?: Room }
  ) {
    this.form = this.fb.group({
      room_number: [data.room?.room_number || '', Validators.required],
      floor: [data.room?.floor || 1, [Validators.required, Validators.min(1)]],
      room_type: [data.room?.room_type || 'double', Validators.required],
      capacity: [data.room?.capacity || 2, [Validators.required, Validators.min(1)]],
      rent: [data.room?.rent || 5000, [Validators.required, Validators.min(0)]],
      status: [data.room?.status || 'available', Validators.required],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data.room, ...this.form.value });
    }
  }
}
