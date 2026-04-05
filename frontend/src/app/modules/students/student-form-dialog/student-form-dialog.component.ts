import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Student } from '../../../core/models';

@Component({
  selector: 'app-student-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.student ? 'Edit Student' : 'Add Student' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Course</mat-label>
          <input matInput formControlName="course" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Year</mat-label>
          <mat-select formControlName="year">
            <mat-option [value]="1">1st Year</mat-option>
            <mat-option [value]="2">2nd Year</mat-option>
            <mat-option [value]="3">3rd Year</mat-option>
            <mat-option [value]="4">4th Year</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Room Number</mat-label>
          <mat-select formControlName="room_number">
            @for (room of data.availableRooms; track room) {
              <mat-option [value]="room">{{ room }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (!data.student) {
          <mat-form-field appearance="outline">
            <mat-label>Initial Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="Enter temporary password" />
            <mat-icon matSuffix>lock</mat-icon>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button class="primary-btn" [disabled]="form.invalid" (click)="onSave()">
        {{ data.student ? 'Update' : 'Add' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;
      min-width: 400px; padding-top: 16px;
    }
    .primary-btn { background: var(--primary-accent) !important; color: #fff !important; border-radius: 12px !important; }
  `],
})
export class StudentFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StudentFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student?: Student; availableRooms: string[] }
  ) {
    this.form = this.fb.group({
      name: [data.student?.name || '', Validators.required],
      email: [data.student?.email || '', [Validators.required, Validators.email]],
      phone: [data.student?.phone || '', Validators.required],
      course: [data.student?.course || '', Validators.required],
      year: [data.student?.year || 1, Validators.required],
      room_number: [data.student?.room_number || '', Validators.required],
      password: [!data.student ? 'Welcome@123' : '', !data.student ? [Validators.required, Validators.minLength(6)] : []],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data.student, ...this.form.value });
    }
  }
}
