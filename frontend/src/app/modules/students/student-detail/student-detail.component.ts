import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudentService } from '../../../core/services/student.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule, MatTabsModule,
    MatTableModule, MatButtonModule, MatSnackBarModule, StatusBadgePipe
  ],
  template: `
    <div class="detail-container">
      <div class="header">
        <button mat-icon-button routerLink="/admin/students" class="back-btn">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="title">Student Profile</h1>
      </div>

      @if (loading) {
        <div class="loading-state">
          <p>Loading student data...</p>
        </div>
      } @else if (student) {
        <div class="profile-header glass-card">
          <div class="avatar-info">
            <div class="avatar">{{ student.name.charAt(0) }}</div>
            <div class="info">
              <h2>{{ student.name }}</h2>
              <span class="role-badge">{{ student.role | titlecase }}</span>
              <p class="email"><mat-icon>email</mat-icon> {{ student.email }}</p>
            </div>
          </div>
          <div class="quick-stats">
            <div class="q-stat">
              <span class="label">Room</span>
              <span class="value">{{ student.room_number || 'Not Assigned' }}</span>
            </div>
            <div class="q-stat">
              <span class="label">Course</span>
              <span class="value">{{ student.course || 'N/A' }}</span>
            </div>
            <div class="q-stat">
              <span class="label">Year</span>
              <span class="value">{{ student.year || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <mat-tab-group class="detail-tabs">
          <mat-tab label="Overview">
            <div class="tab-content grid">
              <mat-card class="info-card">
                <h3><mat-icon>person</mat-icon> Personal Information</h3>
                <div class="data-list">
                  <div class="item"><span class="label">Full Name:</span> <span class="val">{{ student.name }}</span></div>
                  <div class="item"><span class="label">Email Address:</span> <span class="val">{{ student.email }}</span></div>
                  <div class="item"><span class="label">Phone Number:</span> <span class="val">{{ student.phone || '-' }}</span></div>
                </div>
              </mat-card>

              <mat-card class="info-card">
                <h3><mat-icon>school</mat-icon> Academic Details</h3>
                <div class="data-list">
                  <div class="item"><span class="label">Course/Degree:</span> <span class="val">{{ student.course || '-' }}</span></div>
                  <div class="item"><span class="label">Study Year:</span> <span class="val">{{ student.year || '-' }}</span></div>
                </div>
              </mat-card>

              <mat-card class="info-card full-width" *ngIf="student.room_number">
                <h3><mat-icon>meeting_room</mat-icon> Current Residence</h3>
                <div class="data-list horizontal">
                  <div class="item"><span class="label">Room Number:</span> <span class="val">{{ student.room_number }}</span></div>
                  <div class="item"><span class="label">Room Status:</span> <span class="badge badge-success">Active</span></div>
                </div>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Fees & Payments">
            <div class="tab-content">
              @if (fees.length > 0) {
                <table mat-table [dataSource]="fees" class="detail-table">
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let f">{{ f.fee_type | titlecase }}</td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let f">₹{{ f.amount | number }}</td>
                  </ng-container>
                  <ng-container matColumnDef="dueDate">
                    <th mat-header-cell *matHeaderCellDef>Due Date</th>
                    <td mat-cell *matCellDef="let f">{{ f.due_date | date }}</td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let f">
                      <span class="badge" [ngClass]="f.status | statusBadge">{{ f.status | titlecase }}</span>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['type','amount','dueDate','status']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['type','amount','dueDate','status'];"></tr>
                </table>
              } @else {
                <div class="empty-state">No payment history found.</div>
              }
            </div>
          </mat-tab>

          <mat-tab label="Complaints">
            <div class="tab-content">
              @if (complaints.length > 0) {
                <table mat-table [dataSource]="complaints" class="detail-table">
                  <ng-container matColumnDef="title">
                    <th mat-header-cell *matHeaderCellDef>Issue</th>
                    <td mat-cell *matCellDef="let c">{{ c.title }}</td>
                  </ng-container>
                  <ng-container matColumnDef="priority">
                    <th mat-header-cell *matHeaderCellDef>Priority</th>
                    <td mat-cell *matCellDef="let c">
                      <span class="priority-dot" [ngClass]="c.priority"></span>
                      {{ c.priority | titlecase }}
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let c">
                      <span class="badge" [ngClass]="c.status | statusBadge">{{ c.status | titlecase }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Created</th>
                    <td mat-cell *matCellDef="let c">{{ c.created_at | date }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="['title','priority','status','date']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['title','priority','status','date'];"></tr>
                </table>
              } @else {
                <div class="empty-state">No complaints registered.</div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 1000px; margin: 0 auto; padding: 20px; animation: fadeIn 0.4s ease-out; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 700; color: var(--text-main); margin: 0; }
    .back-btn { color: var(--text-muted); }
    
    .profile-header {
      padding: 32px; border-radius: 20px; display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 24px; background: var(--card-bg); border: 1px solid var(--border-color);
    }
    .avatar-info { display: flex; align-items: center; gap: 24px; }
    .avatar {
      width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff; font-size: 32px; font-weight: 700; display: flex; align-items: center; justify-content: center;
    }
    .info h2 { font-size: 24px; font-weight: 800; color: var(--text-main); margin: 0 0 4px; }
    .role-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; background: #eef2ff; color: #4f46e5; padding: 2px 10px; border-radius: 6px; }
    .email { margin: 8px 0 0; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-size: 14px; mat-icon { font-size: 16px; width: 16px; height: 16px; } }
    
    .quick-stats { display: flex; gap: 32px; }
    .q-stat { display: flex; flex-direction: column; align-items: flex-end; }
    .q-stat .label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .q-stat .value { font-size: 18px; font-weight: 700; color: var(--text-main); }

    .detail-tabs { background: transparent; }
    .tab-content { padding: 24px 0; }
    .tab-content.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    
    .info-card {
      padding: 24px !important; border-radius: 16px !important; border: 1px solid var(--border-color);
      background: var(--card-bg) !important;
      h3 { font-size: 16px; font-weight: 700; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; color: var(--text-main); mat-icon { color: #4f46e5; } }
    }
    .full-width { grid-column: span 2; }
    .data-list { display: flex; flex-direction: column; gap: 12px; }
    .data-list.horizontal { flex-direction: row; gap: 40px; }
    .item { display: flex; flex-direction: column; gap: 4px; }
    .item .label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
    .item .val { font-size: 15px; color: var(--text-main); font-weight: 600; }

    .detail-table { width: 100%; background: transparent !important; }
    .badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #ecfdf5; color: #059669; }
    .priority-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
    .priority-dot.high { background: #dc2626; }
    .priority-dot.medium { background: #d97706; }
    .priority-dot.low { background: #059669; }
    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); background: var(--surface-2); border-radius: 12px; border: 1px dashed var(--border-color); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) { .tab-content.grid { grid-template-columns: 1fr; } .profile-header { flex-direction: column; gap: 24px; align-items: flex-start; } .quick-stats { width: 100%; justify-content: space-between; } }
  `],
})
export class StudentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private snackBar = inject(MatSnackBar);

  student: any = null;
  fees: any[] = [];
  complaints: any[] = [];
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Student Detail OnInit - ID:', id);
    if (id) {
      this.fetchData(id);
    } else {
      this.loading = false;
      this.snackBar.open('No student ID provided', 'Close', { duration: 3000 });
    }
  }

  fetchData(id: string): void {
    this.loading = true;
    console.log('Fetching student data for ID:', id);
    this.studentService.getById(id).subscribe({
      next: (val) => {
        console.log('Student found:', val);
        this.student = val;
        this.loading = false;
        this.fetchRelatedData(id);
      },
      error: (err) => {
        console.error('Error fetching student details:', err);
        this.snackBar.open('Failed to load student profile - ' + (err.error || 'Not Found'), 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  fetchRelatedData(id: string): void {
    console.log('Fetching related data (fees/complaints) for:', id);
    this.studentService.getFees(id).subscribe({
      next: (f) => {
        console.log('Fees loaded:', f.length);
        this.fees = f;
      },
      error: (e) => console.error('Error fetching fees:', e)
    });

    this.studentService.getComplaints(id).subscribe({
      next: (c) => {
        console.log('Complaints loaded:', c.length);
        this.complaints = c;
      },
      error: (e) => console.error('Error fetching complaints:', e)
    });
  }
}
