import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-visitor-checkin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule],
  template: `
    <mat-card class="form-card">
      <h2 class="form-title">Check-in a visitor</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Visitor Name</mat-label><input matInput formControlName="visitorName"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="visitorPhone"></mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="outline"><mat-label>Visiting Student</mat-label><input matInput formControlName="visitingStudent"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Room No.</mat-label><input matInput formControlName="roomNumber"></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Purpose</mat-label><textarea matInput formControlName="purpose" rows="2"></textarea>
        </mat-form-field>
        <button mat-flat-button class="submit-btn" type="submit" [disabled]="form.invalid">Check In</button>
      </form>
    </mat-card>
  `,
  styles: [`
    .form-card { background: #fff !important; border: 1px solid #f1f5f9; border-radius: 12px !important; padding: 24px !important; max-width: 600px; }
    .form-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 16px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full { width: 100%; }
    .submit-btn { background: #4f46e5 !important; color: #fff !important; border-radius: 8px !important; font-weight: 500; width: 100%; height: 42px; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }
  `],
})
export class VisitorCheckinFormComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      visitorName: ['', Validators.required], visitorPhone: ['', Validators.required],
      visitingStudent: ['', Validators.required], roomNumber: ['', Validators.required],
      purpose: ['', Validators.required],
    });
  }
  onSubmit(): void {
    if (this.form.valid) { this.snackBar.open('Visitor checked in', 'OK', { duration: 3000 }); this.form.reset(); }
  }
}
