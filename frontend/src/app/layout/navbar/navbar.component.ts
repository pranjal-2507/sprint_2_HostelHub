import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule],
  template: `
    <mat-toolbar class="navbar">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="spacer"></span>
      <button mat-icon-button [matMenuTriggerFor]="notifMenu" matBadge="3" matBadgeColor="warn" matBadgeSize="small">
        <mat-icon>notifications_none</mat-icon>
      </button>
      <mat-menu #notifMenu="matMenu">
        <div class="notif-header">Notifications</div>
        <button mat-menu-item><mat-icon>warning_amber</mat-icon><span>3 overdue payments</span></button>
        <button mat-menu-item><mat-icon>build_circle</mat-icon><span>5 pending requests</span></button>
        <button mat-menu-item><mat-icon>person</mat-icon><span>2 visitors checked-in</span></button>
      </mat-menu>
      <button mat-icon-button [matMenuTriggerFor]="profileMenu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item><mat-icon>person</mat-icon><span>Profile</span></button>
        <button mat-menu-item><mat-icon>settings</mat-icon><span>Settings</span></button>
        <mat-divider></mat-divider>
        <button mat-menu-item><mat-icon>logout</mat-icon><span>Logout</span></button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: #fff; border-bottom: 1px solid #f1f5f9; color: #334155;
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      height: 56px; padding: 0 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }
    .spacer { flex: 1; }
    .notif-header { padding: 10px 16px; font-weight: 600; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
  `],
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
}
