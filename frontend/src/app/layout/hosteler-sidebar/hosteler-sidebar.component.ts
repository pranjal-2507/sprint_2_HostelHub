import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hosteler-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="sidebar">
      <div class="brand">
        <span class="brand-name">HostelHub</span>
        <span class="role-tag">Student</span>
      </div>
      
      <div class="nav-container">
        @for (group of menuGroups; track group.title) {
          <div class="nav-group">
            <h3 class="group-title">{{ group.title }}</h3>
            <mat-nav-list class="nav-list">
              @for (item of group.items; track item.route) {
                <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link" class="nav-item">
                  <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                  <span matListItemTitle>{{ item.label }}</span>
                </a>
              }
            </mat-nav-list>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sidebar { display: flex; flex-direction: column; height: 100%; background: var(--sidebar-bg); }
    .brand {
      padding: 24px 20px; border-bottom: 1px solid var(--border-color);
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .brand-name { font-size: 20px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; }
    .role-tag {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      background: var(--badge-success-bg); color: var(--badge-success-text); padding: 2px 8px; border-radius: 6px;
      letter-spacing: 0.5px;
    }
    
    .nav-container { flex: 1; overflow-y: auto; padding: 0 12px 24px; }
    .nav-group { margin-top: 20px; }
    .group-title {
      font-size: 11px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 1px;
      padding: 0 12px; margin-bottom: 8px;
    }
    
    .nav-list { padding: 0 !important; }
    .nav-item {
      height: 44px !important; border-radius: 10px !important; margin-bottom: 4px;
      color: var(--text-muted) !important; transition: all 0.2s ease;
      
      mat-icon { font-size: 20px; width: 20px; height: 20px; margin-right: 12px; color: var(--text-muted); }
      span { font-size: 14px; font-weight: 500; }
      
      &:hover { background: var(--bg-color) !important; color: var(--text-main) !important; }
    }
    
    .active-link {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
      color: #fff !important; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
      
      mat-icon { color: #fff !important; }
      span { font-weight: 600; }
    }
  `],
})
export class HostelerSidebarComponent {
  menuGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/hosteler/dashboard' },
      ]
    },
    {
      title: 'Stay Info',
      items: [
        { label: 'My Room', icon: 'bed', route: '/hosteler/my-room' },
        { label: 'Payments', icon: 'payments', route: '/hosteler/payments' },
      ]
    },
    {
      title: 'Services',
      items: [
        { label: 'Complaints', icon: 'report_problem', route: '/hosteler/complaints' },
        { label: 'Notices', icon: 'campaign', route: '/hosteler/notices' },
        { label: 'Profile', icon: 'person', route: '/hosteler/profile' },
      ]
    }
  ];
}
