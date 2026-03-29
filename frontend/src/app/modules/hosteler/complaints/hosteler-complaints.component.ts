import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { ComplaintService } from '../../../core/services/complaint.service';
import { Complaint } from '../../../core/models';

@Component({
  selector: 'app-new-complaint-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>add</mat-icon>
        Raise New Complaint
      </h2>
    </div>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="complaintForm" class="complaint-form">
        <mat-form-field appearance="outline">
          <mat-label>Complaint Title</mat-label>
          <input matInput formControlName="title" placeholder="Brief description of the issue">
          <mat-error *ngIf="complaintForm.get('title')?.hasError('required')">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4" 
                    placeholder="Provide detailed information about the issue"></textarea>
          <mat-error *ngIf="complaintForm.get('description')?.hasError('required')">
            Description is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submitComplaint()" [disabled]="complaintForm.invalid || loading">
        <mat-icon>send</mat-icon>
        {{ loading ? 'Submitting...' : 'Submit Complaint' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header h2 {
      display: flex; align-items: center; gap: 8px; margin: 0;
      mat-icon { color: #059669; }
    }
    .dialog-content { padding: 20px 0; }
    .complaint-form {
      display: flex; flex-direction: column; gap: 16px; min-width: 400px;
    }
    .dialog-actions {
      padding: 16px 0 0; justify-content: flex-end; gap: 8px;
      button { display: flex; align-items: center; gap: 4px; }
    }
  `]
})
export class NewComplaintDialogComponent {
  complaintForm: FormGroup;
  loading = false;
  private complaintService = inject(ComplaintService);
  private dialogRef = inject(MatDialogRef<NewComplaintDialogComponent>);

  constructor(private fb: FormBuilder) {
    this.complaintForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required]
    });
  }

  submitComplaint() {
    if (this.complaintForm.valid) {
      this.loading = true;
      this.complaintService.createComplaint(this.complaintForm.value).subscribe({
        next: (res) => {
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error submitting complaint', err);
          this.loading = false;
          alert('Failed to submit complaint. Please try again.');
        }
      });
    }
  }
}

@Component({
  selector: 'app-hosteler-complaints',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatButtonModule, MatChipsModule, StatusBadgePipe],
  template: `
    <div class="complaints">
      <div class="page-header">
        <h1 class="page-title">My Complaints</h1>
        <button mat-raised-button color="primary" class="new-complaint-btn" (click)="openNewComplaintDialog()">
          <mat-icon>add</mat-icon>
          Raise New Complaint
        </button>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading complaints...</p>
        </div>
      } @else {
        <!-- Complaints Summary -->
        <div class="summary-grid">
          <div class="summary-card total-card">
            <div class="card-icon" style="background: var(--surface-2); color: #4f46e5;">
              <mat-icon>report</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ complaints.length }}</span>
              <span class="card-label">Total Complaints</span>
            </div>
          </div>

          <div class="summary-card pending-card">
            <div class="card-icon" style="background: var(--surface-2); color: #d97706;">
              <mat-icon>pending</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ getPendingCount() }}</span>
              <span class="card-label">Pending</span>
            </div>
          </div>

          <div class="summary-card progress-card">
            <div class="card-icon" style="background: var(--surface-2); color: #0284c7;">
              <mat-icon>autorenew</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ getInProgressCount() }}</span>
              <span class="card-label">In Progress</span>
            </div>
          </div>

          <div class="summary-card resolved-card">
            <div class="card-icon" style="background: var(--surface-2); color: #059669;">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="card-content">
              <span class="card-value">{{ getResolvedCount() }}</span>
              <span class="card-label">Resolved</span>
            </div>
          </div>
        </div>

        <!-- Complaints List -->
        <mat-card class="complaints-card">
          <div class="card-header">
            <h2 class="card-title">
              <mat-icon>list</mat-icon>
              Complaint History
            </h2>
          </div>
          @if (complaints.length > 0) {
            <div class="complaints-list">
              @for (complaint of complaints; track complaint.id) {
                <div class="complaint-item" [class]="'status-' + complaint.status">
                  <div class="complaint-header">
                    <div class="complaint-title-section">
                      <h3 class="complaint-title">{{ complaint.title }}</h3>
                      <div class="complaint-badges">
                        <mat-chip-set>
                          <mat-chip [class]="'priority-' + complaint.priority">{{ complaint.priority | titlecase }}</mat-chip>
                          <mat-chip [class]="complaint.status | statusBadge">{{ complaint.status | titlecase }}</mat-chip>
                        </mat-chip-set>
                      </div>
                    </div>
                    <div class="complaint-date">
                      <mat-icon>schedule</mat-icon>
                      <span>{{ complaint.created_at | date:'dd MMM yyyy, HH:mm' }}</span>
                    </div>
                  </div>
                  
                  <div class="complaint-body">
                    <p class="complaint-description">{{ complaint.description }}</p>
                    
                    @if (complaint.status === 'resolved' && complaint.resolved_at) {
                      <div class="resolution-info">
                        <mat-icon>check_circle</mat-icon>
                        <span>Resolved on {{ complaint.resolved_at | date:'dd MMM yyyy, HH:mm' }}</span>
                      </div>
                    }
                  </div>

                  <div class="complaint-footer">
                    <div class="complaint-id">
                      <mat-icon>tag</mat-icon>
                      <span>ID: {{ complaint.id.substring(0, 8) }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <mat-icon>report</mat-icon>
              <h3>No Complaints Found</h3>
              <p>You haven't raised any complaints yet.</p>
              <button mat-raised-button color="primary" (click)="openNewComplaintDialog()">
                <mat-icon>add</mat-icon>
                Raise Your First Complaint
              </button>
            </div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .complaints { max-width: 1200px; padding: 0 16px; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0; }
    .new-complaint-btn { display: flex; align-items: center; gap: 8px; }
    
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }

    .summary-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
    }
    .summary-card {
      background: var(--card-bg); border-radius: 12px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      border: 1px solid var(--border-color);
    }
    .card-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { font-size: 24px; width: 24px; height: 24px; }
    }
    .card-content { display: flex; flex-direction: column; }
    .card-value { font-size: 20px; font-weight: 700; color: var(--text-main); }
    .card-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    
    .complaints-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 24px !important; margin-bottom: 16px;
    }
    .card-header { margin-bottom: 20px; }
    .card-title {
      font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0;
      display: flex; align-items: center; gap: 8px;
      mat-icon { color: #059669; }
    }
    
    .complaints-list { display: flex; flex-direction: column; gap: 16px; }
    .complaint-item {
      border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;
      background: var(--surface-2);
      &.status-pending { border-left: 4px solid #d97706; }
      &.status-in-progress { border-left: 4px solid #0284c7; }
      &.status-resolved { border-left: 4px solid #059669; }
    }
    
    .complaint-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;
    }
    .complaint-title-section { flex: 1; }
    .complaint-title { font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0 0 8px; }
    .complaint-badges mat-chip-set { display: flex; gap: 8px; }
    .complaint-date {
      display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-muted);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    
    .complaint-body { margin-bottom: 16px; }
    .complaint-description { 
      font-size: 14px; color: var(--text-muted); line-height: 1.6; margin: 0 0 12px; 
    }
    .resolution-info {
      display: flex; align-items: center; gap: 8px; padding: 8px 12px;
      background: var(--badge-success-bg); border-radius: 6px; color: var(--badge-success-text); font-size: 13px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    
    .complaint-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 12px; border-top: 1px solid var(--border-color);
    }
    .complaint-id {
      display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    
    .priority-high { background: var(--badge-danger-bg); color: var(--badge-danger-text); }
    .priority-medium { background: var(--badge-warning-bg); color: var(--badge-warning-text); }
    .priority-low { background: var(--badge-success-bg); color: var(--badge-success-text); }
    
    .empty-state {
      text-align: center; padding: 60px 20px; color: #94a3b8;
      mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
      h3 { font-size: 18px; color: var(--text-main); margin: 0 0 8px; }
      p { margin: 0 0 24px; font-size: 14px; color: var(--text-muted); }
      button { display: flex; align-items: center; gap: 8px; margin: 0 auto; }
    }
    
    @media (max-width: 1024px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
    @media (max-width: 600px) {
      .summary-grid { grid-template-columns: 1fr; }
      .complaint-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .complaint-footer { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `],
})
export class HostelerComplaintsComponent implements OnInit {
  complaints: Complaint[] = [];
  loading = true;
  private complaintService = inject(ComplaintService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.loading = true;
    this.complaintService.getHostelerComplaints().subscribe({
      next: (data) => {
        this.complaints = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching complaints', err);
        this.loading = false;
      }
    });
  }

  getPendingCount(): number {
    return this.complaints.filter(c => c.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.complaints.filter(c => c.status === 'in-progress').length;
  }

  getResolvedCount(): number {
    return this.complaints.filter(c => c.status === 'resolved').length;
  }

  openNewComplaintDialog() {
    const dialogRef = this.dialog.open(NewComplaintDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchComplaints();
      }
    });
  }
}