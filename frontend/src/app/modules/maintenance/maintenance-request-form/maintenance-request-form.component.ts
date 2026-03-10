import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-maintenance-request-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    ],
    template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">build</mat-icon>
      Submit Maintenance Request
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="request-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Brief description of the issue" />
          <mat-error>Title is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Room Number</mat-label>
          <input matInput formControlName="roomNumber" placeholder="e.g. 204" />
          <mat-error>Room number is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option value="plumbing">Plumbing</mat-option>
            <mat-option value="electrical">Electrical</mat-option>
            <mat-option value="furniture">Furniture</mat-option>
            <mat-option value="cleaning">Cleaning</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
          <mat-error>Category is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
            <mat-option value="urgent">Urgent</mat-option>
          </mat-select>
          <mat-error>Priority is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="Detailed description of the issue"></textarea>
          <mat-error>Description is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">Submit</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .title-icon { vertical-align: middle; margin-right: 8px; color: #ffab40; }
    .request-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .full-width { width: 100%; }
  `],
})
export class MaintenanceRequestFormComponent {
    form: FormGroup;

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<MaintenanceRequestFormComponent>) {
        this.form = this.fb.group({
            title: ['', Validators.required],
            roomNumber: ['', Validators.required],
            category: ['', Validators.required],
            priority: ['medium', Validators.required],
            description: ['', Validators.required],
        });
    }

    onSubmit(): void {
        if (this.form.valid) { this.dialogRef.close(this.form.value); }
    }

    onCancel(): void { this.dialogRef.close(); }
}
