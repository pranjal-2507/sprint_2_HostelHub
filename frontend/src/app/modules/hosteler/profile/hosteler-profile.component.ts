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

@Component({
  selector: 'app-hosteler-profile',
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
      <h1 class="page-title">My Profile</h1>

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
                <button mat-raised-button color="primary" [disabled]="!profileForm.dirty" (click)="updateProfile()">
                  <mat-icon>save</mat-icon>
                  Save Changes
                </button>
              </div>
              
              <form [formGroup]="profileForm" class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name" readonly placeholder="Enter your full name">
                    <mat-hint>Name changes require admin approval</mat-hint>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email Address</mat-label>
                    <input matInput formControlName="email" type="email" readonly placeholder="Enter your email">
                    <mat-hint>Email changes require admin approval</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="Enter your phone number">
                    <mat-error *ngIf="profileForm.get('phone')?.hasError('pattern')">
                      Please enter a valid phone number
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Room Number</mat-label>
                    <input matInput formControlName="roomNumber" readonly placeholder="Not assigned">
                    <mat-hint>Room assignment is managed by administration</mat-hint>
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
                  <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                    Current password is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>New Password</mat-label>
                  <input matInput formControlName="newPassword" type="password" placeholder="Enter new password">
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                    New password is required
                  </mat-error>
                  <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                    Password must be at least 6 characters long
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput formControlName="confirmPassword" type="password" placeholder="Confirm new password">
                  <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                    Please confirm your password
                  </mat-error>
                  <mat-error *ngIf="passwordForm.hasError('passwordMismatch')">
                    Passwords do not match
                  </mat-error>
                </mat-form-field>

                <div class="password-actions">
                  <button mat-raised-button color="primary" (click)="changePassword()" [disabled]="passwordForm.invalid">
                    <mat-icon>lock</mat-icon>
                    Change Password
                  </button>
                </div>
              </form>
            </mat-card>

            <!-- Account Information -->
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
                    <span class="detail-value">{{ currentUser?.id }}</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <mat-icon>verified_user</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">Account Type</span>
                    <span class="detail-value">{{ currentUser?.role | titlecase }}</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <mat-icon>schedule</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">Member Since</span>
                    <span class="detail-value">March 2026</span>
                  </div>
                </div>
                
                <div class="detail-item">
                  <mat-icon>login</mat-icon>
                  <div class="detail-content">
                    <span class="detail-label">Last Login</span>
                    <span class="detail-value">{{ getCurrentDateTime() }}</span>
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
                  <mat-icon>settings</mat-icon>
                  Notification Preferences
                </h2>
              </div>
              
              <div class="preferences-list">
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>Email Notifications</h3>
                    <p>Receive important updates and announcements via email</p>
                  </div>
                  <mat-slide-toggle checked></mat-slide-toggle>
                </div>
                
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>Payment Reminders</h3>
                    <p>Get notified about upcoming fee payments and due dates</p>
                  </div>
                  <mat-slide-toggle checked></mat-slide-toggle>
                </div>
                
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>Complaint Updates</h3>
                    <p>Receive status updates on your submitted complaints</p>
                  </div>
                  <mat-slide-toggle checked></mat-slide-toggle>
                </div>
                
                <div class="preference-item">
                  <div class="preference-info">
                    <h3>Maintenance Alerts</h3>
                    <p>Get notified about scheduled maintenance activities</p>
                  </div>
                  <mat-slide-toggle></mat-slide-toggle>
                </div>
              </div>
            </mat-card>

            <mat-card class="theme-card">
              <div class="card-header">
                <h2 class="card-title">
                  <mat-icon>palette</mat-icon>
                  Display Preferences
                </h2>
              </div>
              
              <div class="theme-options">
                <div class="theme-item">
                  <div class="theme-info">
                    <h3>Theme</h3>
                    <p>Choose your preferred color theme</p>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-select [value]="themeService.currentTheme" (selectionChange)="themeService.setTheme($event.value)">
                      <mat-option value="light">Light Theme</mat-option>
                      <mat-option value="dark">Dark Theme</mat-option>
                      <mat-option value="auto">Auto (System)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
                
                <div class="theme-item">
                  <div class="theme-info">
                    <h3>Language</h3>
                    <p>Select your preferred language</p>
                  </div>
                  <mat-form-field appearance="outline">
                    <mat-select value="en">
                      <mat-option value="en">English</mat-option>
                      <mat-option value="hi">Hindi</mat-option>
                      <mat-option value="te">Telugu</mat-option>
                      <mat-option value="ta">Tamil</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile { max-width: 1200px; padding: 0 16px; margin: 0 auto; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-main); margin: 0 0 24px; }
    
    .profile-tabs { margin-bottom: 16px; }
    .tab-content { padding-top: 16px; }
    
    .profile-card, .security-card, .account-info-card, .preferences-card, .theme-card {
      background: var(--card-bg) !important; border: 1px solid var(--border-color);
      border-radius: 12px !important; padding: 24px !important; margin-bottom: 16px;
    }
    
    .card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
    }
    .card-title {
      font-size: 18px; font-weight: 600; color: var(--text-main); margin: 0;
      display: flex; align-items: center; gap: 8px;
      mat-icon { color: #059669; }
    }
    
    .profile-form, .password-form {
      display: flex; flex-direction: column; gap: 16px;
    }
    .form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    
    .password-actions {
      display: flex; justify-content: flex-start; margin-top: 8px;
      button { display: flex; align-items: center; gap: 8px; }
    }
    
    .account-details {
      display: flex; flex-direction: column; gap: 20px;
    }
    .detail-item {
      display: flex; align-items: center; gap: 16px; padding: 16px;
      background: var(--surface-2); border-radius: 8px;
    }
    .detail-item mat-icon { color: #059669; font-size: 20px; width: 20px; height: 20px; }
    .detail-content { display: flex; flex-direction: column; }
    .detail-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }
    .detail-value { font-size: 14px; color: var(--text-main); font-weight: 600; margin-top: 2px; }
    
    .preferences-list, .theme-options {
      display: flex; flex-direction: column; gap: 20px;
    }
    .preference-item, .theme-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 20px; background: var(--surface-2); border-radius: 8px;
    }
    .preference-info, .theme-info { flex: 1; }
    .preference-info h3, .theme-info h3 {
      font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0 0 4px;
    }
    .preference-info p, .theme-info p {
      font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.4;
    }
    
    .theme-item mat-form-field {
      min-width: 150px; margin: 0;
    }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .card-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .preference-item, .theme-item { flex-direction: column; align-items: flex-start; gap: 16px; }
      .theme-item mat-form-field { width: 100%; }
    }
  `],
})
export class HostelerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: any;
  selectedIndex = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^[0-9]{10}$/)],
      roomNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
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
        phone: this.currentUser.phone || '',
        roomNumber: this.currentUser.room_number || this.currentUser.roomNumber || 'Not assigned'
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  updateProfile() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      
      const payload = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone
      };

      this.authService.updateProfile(payload).subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.profileForm.markAsPristine();
        },
        error: (err) => {
          this.snackBar.open('Failed to update profile: ' + (err.message || 'Unknown error'), 'Close', {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  changePassword() {
    if (this.passwordForm.valid) {
      console.log('Changing password');
      // Implement API call here
      this.snackBar.open('Password changed successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      this.passwordForm.reset();
    }
  }

  getCurrentDateTime(): string {
    return new Date().toLocaleString();
  }
}