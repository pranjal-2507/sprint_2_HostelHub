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
    <mat-toolbar class="navbar">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="notifMenu" [matBadge]="activeNotificationsCount" matBadgeColor="warn" matBadgeSize="small" [matBadgeHidden]="activeNotificationsCount === 0">
        <mat-icon>notifications_none</mat-icon>
      </button>
      <mat-menu #notifMenu="matMenu">
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
      <button mat-icon-button [matMenuTriggerFor]="profileMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item routerLink="/admin/profile"><mat-icon>person</mat-icon><span>Profile</span></button>
        <button mat-menu-item [routerLink]="['/admin/profile']" [queryParams]="{ tab: 2 }"><mat-icon>settings</mat-icon><span>Settings</span></button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: var(--sidebar-bg); border-bottom: 1px solid var(--border-color); color: var(--text-main);
      position: relative; z-index: 1000;
      height: 56px; padding: 0 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .spacer { flex: 1; }
    .notif-header { padding: 10px 16px; font-weight: 600; font-size: 13px; color: var(--text-main); border-bottom: 1px solid var(--border-color); }
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
    this.loadStats();
  }

  loadStats() {
    this.dashboardService.getAdminStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Error loading notification stats', err)
    });
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
