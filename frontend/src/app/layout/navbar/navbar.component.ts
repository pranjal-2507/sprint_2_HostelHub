import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardService, DashboardStats } from '../../core/services';

import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatDialogModule, RouterModule],
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
          <button mat-icon-button class="nav-btn notif-btn" 
            [matMenuTriggerFor]="notifMenu" 
            [matBadge]="activeNotificationsCount" 
            matBadgeColor="warn" 
            matBadgeSize="small"
            [matBadgeHidden]="activeNotificationsCount === 0">
            <mat-icon>notifications_none</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu" class="glass-menu">
            <div class="notif-header">Notifications</div>
            <ng-container *ngIf="stats; else loading">
              <button mat-menu-item *ngIf="stats.overdue_payments > 0">
                <mat-icon color="warn">warning_amber</mat-icon>
                <span>{{stats.overdue_payments}} overdue payments</span>
              </button>
              <button mat-menu-item *ngIf="stats.pending_maintenance > 0">
                <mat-icon color="accent">build_circle</mat-icon>
                <span>{{stats.pending_maintenance}} pending requests</span>
              </button>
              <button mat-menu-item *ngIf="stats.visitors_checked_in > 0">
                <mat-icon color="primary">person</mat-icon>
                <span>{{stats.visitors_checked_in}} visitors checked-in</span>
              </button>
              <div class="empty-notif" *ngIf="activeNotificationsCount === 0">
                No new notifications
              </div>
            </ng-container>
            <ng-template #loading>
              <div class="empty-notif">Loading notifications...</div>
            </ng-template>
          </mat-menu>
          
          <button mat-icon-button class="nav-btn user-btn" [matMenuTriggerFor]="profileMenu">
            <mat-icon>person_outline</mat-icon>
          </button>
          <mat-menu #profileMenu="matMenu" class="glass-menu">
            <button mat-menu-item [routerLink]="getProfileLink()"><mat-icon>person</mat-icon><span>Profile</span></button>
            <button mat-menu-item [routerLink]="[getProfileLink()]" [queryParams]="{ tab: 2 }"><mat-icon>settings</mat-icon><span>Settings</span></button>
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
      display: flex; align-items: center; justify-content: center;
      
      mat-icon { font-size: 20px; color: var(--text-main); }
      
      &:hover {
        background: white !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
    }

    .menu-trigger {
      color: var(--text-heading) !important;
      margin-right: 8px;
    }
    
    :host-context(body.dark-theme) .nav-btn {
      background: rgba(30, 41, 59, 0.8) !important;
      border-color: rgba(255,255,255,0.1) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
      
      mat-icon { color: #ffffff !important; }
      
      &:hover {
        background: rgba(51, 65, 85, 1) !important;
        border-color: rgba(255,255,255,0.2) !important;
      }
    }

    :host-context(body.dark-theme) .menu-trigger {
      color: #ffffff !important;
    }
    
    .notif-header { padding: 12px 16px; font-family: 'Outfit'; font-weight: 700; font-size: 14px; color: var(--text-heading); border-bottom: 1px solid var(--border-color); }
    .empty-notif { padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px; min-width: 200px; }
  `],
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  stats: DashboardStats | null = null;

  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.loadStats();
    }
  }

  loadStats() {
    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error loading notification stats', err)
    });
  }

  getProfileLink(): string {
    return this.authService.isAdmin() ? '/admin/profile' : '/hosteler/profile';
  }

  get activeNotificationsCount(): number {
    if (!this.stats) return 0;
    let count = 0;
    if (this.stats.overdue_payments > 0) count++;
    if (this.stats.pending_maintenance > 0) count++;
    if (this.stats.visitors_checked_in > 0) count++;
    return count;
  }

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
