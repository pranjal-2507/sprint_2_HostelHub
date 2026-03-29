import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Notice } from '../../../core/models';

@Component({
  selector: 'app-notice-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.notice ? 'Edit Notice' : 'Create Notice' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="4"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option value="general">General</mat-option>
            <mat-option value="event">Event</mat-option>
            <mat-option value="rules">Rules</mat-option>
            <mat-option value="emergency">Emergency</mat-option>
            <mat-option value="maintenance">Maintenance</mat-option>
          </mat-select>
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
        {{ data.notice ? 'Update' : 'Create' }}
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
export class NoticeFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoticeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { notice?: Notice }
  ) {
    this.form = this.fb.group({
      title: [data.notice?.title || '', Validators.required],
      content: [data.notice?.content || '', Validators.required],
      category: [data.notice?.category || 'general', Validators.required],
      priority: [data.notice?.priority || 'medium', Validators.required],
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data.notice, ...this.form.value });
    }
  }
}
