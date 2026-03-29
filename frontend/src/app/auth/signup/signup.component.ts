import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        MatCardModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
    ],
    template: `
    <div class="auth-container">
      <div class="auth-brand">
        <mat-icon class="brand-icon">apartment</mat-icon>
        <span class="brand-name">HostelHub</span>
      </div>
      
      <mat-card class="auth-card">
        <h1 class="auth-title">Create an account</h1>
        <p class="auth-subtitle">Get started with modern hostel management</p>

        <div class="error-banner" *ngIf="errorMessage">
          <mat-icon>error_outline</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="Rahul Sharma" />
            <mat-error *ngIf="signupForm.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" placeholder="name@example.com" />
            <mat-error *ngIf="signupForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="signupForm.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" />
            <button type="button" mat-icon-button matSuffix (click)="hidePassword = !hidePassword" [attr.aria-label]="'Hide password'">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="signupForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
          </mat-form-field>

          <button mat-flat-button class="submit-btn full-width" type="submit" [disabled]="isLoading">
            <span *ngIf="!isLoading">Create Account</span>
            <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Log in</a>
        </div>
      </mat-card>
    </div>
  `,
    styleUrls: ['../login/login.component.css'] // reuse login clean styling layout
})
export class SignupComponent {
    signupForm: FormGroup;
    hidePassword = true;
    isLoading = false;
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.signupForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.register(this.signupForm.value).subscribe({
            next: () => {
                this.snackBar.open('Account created successfully! Please log in.', 'OK', { duration: 4000 });
                this.router.navigate(['/login']);
            },
            error: (err: any) => {
                this.errorMessage = err.message || 'Registration failed';
                this.isLoading = false;
            }
        });
    }
}
