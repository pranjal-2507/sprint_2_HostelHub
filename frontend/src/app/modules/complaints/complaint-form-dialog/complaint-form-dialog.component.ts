import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Complaint } from '../../../core/models';

@Component({
  selector: 'app-complaint-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.complaint ? 'Edit Complaint' : 'New Complaint' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Student Name</mat-label>
          <input matInput formControlName="student_name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Room Number</mat-label>
          <input matInput formControlName="room_number" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button class="primary-btn" [disabled]="form.invalid" (click)="onSave()">
        {{ data.complaint ? 'Update' : 'Submit' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;
      min-width: 400px;
    }
    .full-width { grid-column: 1 / -1; }
    .primary-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; }
  `],
})
export class ComplaintFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComplaintFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { complaint?: Complaint }
  ) {
    this.form = this.fb.group({
      student_name: [data.complaint?.student_name || '', Validators.required],
      room_number: [data.complaint?.room_number || '', Validators.required],
      title: [data.complaint?.title || '', Validators.required],
      description: [data.complaint?.description || '', Validators.required],
      priority: [data.complaint?.priority || 'medium', Validators.required],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data.complaint, ...this.form.value });
    }
  }
}
