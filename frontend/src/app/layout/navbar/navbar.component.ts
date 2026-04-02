import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-logout-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Logout</h2>
    <mat-dialog-content>Are you sure you want to logout?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-stroked-button color="warn" [mat-dialog-close]="true">Logout</button>
    </mat-dialog-actions>
  `
})
export class LogoutConfirmDialogComponent { }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatDialogModule],
  template: `
    <div class="nav-wrapper">
      <mat-toolbar class="navbar glass-card">
        <div class="brand-section">
          <button mat-icon-button class="menu-trigger" (click)="toggleSidebar.emit()">
            <mat-icon>menu</mat-icon>
          </button>
          <div class="brand">
            <span class="hub-text">Hostel</span><span class="hub-accent">Hub</span>
          </div>
        </div>

        <span class="spacer"></span>

        <div class="actions-section">
          <button mat-icon-button class="nav-btn notif-btn" [matMenuTriggerFor]="notifMenu" matBadge="3" matBadgeColor="warn" matBadgeSize="small">
            <mat-icon>notifications_none</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu" class="glass-menu">
            <div class="notif-header">Notifications</div>
            <button mat-menu-item><mat-icon>warning_amber</mat-icon><span>3 overdue payments</span></button>
            <button mat-menu-item><mat-icon>build_circle</mat-icon><span>5 pending requests</span></button>
          </mat-menu>
          
          <button mat-icon-button class="nav-btn user-btn" [matMenuTriggerFor]="profileMenu">
            <mat-icon>person_outline</mat-icon>
          </button>
          <mat-menu #profileMenu="matMenu" class="glass-menu">
            <button mat-menu-item><mat-icon>person</mat-icon><span>Profile</span></button>
            <button mat-menu-item><mat-icon>settings</mat-icon><span>Settings</span></button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
          </mat-menu>
        </div>
      </mat-toolbar>
    </div>
  `,
  styles: [`
    .nav-wrapper {
      padding: 12px 24px; position: sticky; top: 0; z-index: 1000;
    }
    .navbar {
      height: 64px !important; border-radius: 20px !important;
      padding: 0 16px !important; display: flex; align-items: center;
      background: rgba(255, 255, 255, 0.5) !important;
      backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255,255,255,0.4) !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.06) !important;
    }
    body.dark-theme .navbar {
      background: rgba(15, 23, 42, 0.7) !important;
      border-color: rgba(255,255,255,0.05) !important;
    }
    
    .brand-section { display: flex; align-items: center; gap: 8px; }
    .brand { font-family: 'Outfit'; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; }
    .hub-text { color: var(--text-heading); }
    .hub-accent { color: var(--primary-accent); }
    
    .spacer { flex: 1; }
    
    .actions-section { display: flex; align-items: center; gap: 12px; }
    
    .nav-btn {
      width: 42px; height: 42px; border-radius: 12px !important;
      background: rgba(255,255,255,0.6) !important;
      border: 1px solid rgba(0,0,0,0.03) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      mat-icon { font-size: 20px; color: var(--text-main); }
      
      &:hover {
        background: white !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
    }
    body.dark-theme .nav-btn {
      background: rgba(30, 41, 59, 0.6) !important;
      border-color: rgba(255,255,255,0.05) !important;
      mat-icon { color: #f1f5f9; }
    }
    
    .notif-header { padding: 12px 16px; font-family: 'Outfit'; font-weight: 700; font-size: 14px; color: var(--text-heading); border-bottom: 1px solid var(--border-color); }
  `],
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  logout() {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }
}
