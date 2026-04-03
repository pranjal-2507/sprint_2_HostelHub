import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/services/auth.service';
import { ThemeService } from '../../../shared/services/theme.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatTabsModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile">
      <h1 class="page-title">Admin Profile</h1>

      <mat-tab-group class="profile-tabs" [selectedIndex]="selectedIndex" (selectedIndexChange)="selectedIndex = $event">
        <!-- Personal Information Tab -->
        <mat-tab label="Personal Information">
          <div class="tab-content">
            <mat-card class="profile-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>person</mat-icon>
                  Personal Details
                </h2>
                <button mat-raised-button color="primary" [disabled]="!profileForm.dirty || profileForm.invalid" (click)="updateProfile()">
                  <mat-icon>save</mat-icon>
                  Save Changes
                </button>
              </div>
              
              <form [formGroup]="profileForm" class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name" placeholder="Enter your full name">
                    <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                      Name is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email Address</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="Enter your email">
                    <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                      Please enter a valid email
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="Enter your phone number">
                    <mat-error *ngIf="profileForm.get('phone')?.hasError('pattern')">
                      Please enter a valid 10-digit phone number
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Role</mat-label>
                    <input matInput [value]="currentUser?.role | titlecase" readonly>
                    <mat-hint>Role cannot be changed</mat-hint>
                  </mat-form-field>
                </div>
              </form>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Account Security Tab -->
        <mat-tab label="Account Security">
          <div class="tab-content">
            <mat-card class="security-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>security</mat-icon>
                  Change Password
                </h2>
              </div>
              
              <form [formGroup]="passwordForm" class="password-form">
                <mat-form-field appearance="outline">
                  <mat-label>Current Password</mat-label>
                  <input matInput formControlName="currentPassword" type="password" placeholder="Enter current password">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput formControlName="newPassword" type="password" placeholder="Enter new password">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput formControlName="confirmPassword" type="password" placeholder="Confirm new password">
                </mat-form-field>

                <div class="password-actions">
                  <button mat-raised-button color="primary" (click)="changePassword()" [disabled]="passwordForm.invalid">
                    <mat-icon>lock</mat-icon>
                    Change Password
                  </button>
                </div>
              </form>
            </mat-card>

            <mat-card class="account-info-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>info</mat-icon>
                  Account Information
                </h2>
              </div>
              
              <div class="account-details">
                <div class="detail-item">
                  <mat-icon>badge</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">User ID</span>
                    <span class="detail-value text-break">{{ currentUser?.id }}</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <mat-icon>verified_user</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">Account Type</span>
                    <span class="detail-value">{{ currentUser?.role | titlecase }} Account</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <mat-icon>schedule</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">System Access</span>
                    <span class="detail-value">Full Administrative Privileges</span>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Preferences Tab -->
        <mat-tab label="Preferences">
          <div class="tab-content">
            <mat-card class="preferences-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>palette</mat-icon>
                  Display Preferences
                </h2>
              </div>
              
              <div class="theme-options">
                <div class="theme-item">
                  <div class="theme-info">
                    <h3>System Theme</h3>
                    <p>Customize the look and feel of your dashboard</p>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-select [value]="themeService.currentTheme" (selectionChange)="themeService.setTheme($event.value)">
                      <mat-option value="light">Light Mode</mat-option>
                      <mat-option value="dark">Dark Mode</mat-option>
                      <mat-option value="auto">System Default</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </mat-card>

            <mat-card class="preferences-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>notifications</mat-icon>
                  Notification Settings
                </h2>
              </div>
              
              <div class="preferences-list">
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>Email Alerts</h3>
                    <p>Receive notifications for new complaints and messages</p>
                  </div>
                  <mat-slide-toggle [checked]="true"></mat-slide-toggle>
                </div>
                
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>System Updates</h3>
                    <p>Get notified about maintenance and feature updates</p>
                  </div>
                  <mat-slide-toggle [checked]="true"></mat-slide-toggle>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile { max-width: 1000px; margin: 0 auto; padding: 20px; }
    .page-title { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 30px; }
    
    .profile-card, .security-card, .account-info-card, .preferences-card {
      background: var(--card-bg) !important;
      border: 1px solid var(--border-color);
      border-radius: 16px !important;
      padding: 32px !important;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06) !important;
    }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .card-title {
      font-size: 20px; font-weight: 600; color: var(--text-main); margin: 0;
      display: flex; align-items: center; gap: 12px;
      mat-icon { color: var(--primary-color); }
    }
    
    .profile-form, .password-form { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    
    .account-details { display: flex; flex-direction: column; gap: 24px; }
    .detail-item {
      display: flex; align-items: flex-start; gap: 20px; padding: 20px;
      background: var(--surface-2); border-radius: 12px; transition: all 0.2s ease;
    }
    .detail-item:hover { background: var(--surface-3); transform: translateY(-2px); }
    .detail-item mat-icon { color: var(--primary-color); margin-top: 2px; }
    .detail-content { display: flex; flex-direction: column; }
    .detail-label { font-size: 13px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
    .detail-value { font-size: 15px; color: var(--text-main); font-weight: 600; }
    .text-break { word-break: break-all; }
    
    .theme-options, .preferences-list { display: flex; flex-direction: column; gap: 16px; }
    .theme-item, .preference-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 24px; background: var(--surface-2); border-radius: 12px;
    }
    
    .theme-info h3, .preference-info h3 { font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0 0 6px; }
    .theme-info p, .preference-info p { font-size: 14px; color: var(--text-muted); margin: 0; }
    
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .theme-item, .preference-item { flex-direction: column; align-items: flex-start; gap: 20px; }
      .theme-item mat-form-field { width: 100%; }
    }
  `],
})
export class AdminProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: User | null = null;
  selectedIndex = 0;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] !== undefined) {
        this.selectedIndex = Number(params['tab']);
      }
    });

    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone || ''
      });
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      this.authService.updateProfile(updatedData).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.profileForm.markAsPristine();
        },
        error: (err) => {
          this.snackBar.open('Failed to update profile: ' + err.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  changePassword() {
    this.snackBar.open('Password change feature coming soon!', 'Understood', {
      duration: 3000
    });
  }
}
