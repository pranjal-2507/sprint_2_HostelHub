import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <div class="brand">
        <span class="brand-name">HostelHub</span>
      </div>
      <mat-nav-list class="nav-list">
        @for (item of navItems; track item.route) {
          <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link" class="nav-item">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar { display: flex; flex-direction: column; height: 100%; }
    .brand {
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
    }
    .brand-name { font-size: 18px; font-weight: 700; color: #4f46e5; }
    .nav-list { padding: 8px; flex: 1; }
    .nav-item {
      border-radius: 8px !important; margin-bottom: 2px;
      color: #64748b !important; font-size: 14px;
      &:hover { background: #f8f9fb !important; color: #334155 !important; }
    }
    .active-link {
      background: #eef2ff !important; color: #4f46e5 !important;
      font-weight: 500;
      mat-icon { color: #4f46e5; }
    }
  `],
})
export class SidebarComponent {
  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Rooms', icon: 'meeting_room', route: '/rooms' },
    { label: 'Maintenance', icon: 'build', route: '/maintenance' },
    { label: 'Fees', icon: 'payments', route: '/fees' },
    { label: 'Visitors', icon: 'people', route: '/visitors' },
    { label: 'Analytics', icon: 'bar_chart', route: '/analytics' },
  ];
}
