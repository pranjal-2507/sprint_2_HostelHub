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
    .sidebar { display: flex; flex-direction: column; height: 100%; background: transparent; padding-top: 10px; }
    .brand {
      padding: 20px 24px; 
      display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
    }
    .brand-name { font-size: 24px; font-family: 'Outfit'; font-weight: 800; color: var(--text-heading); letter-spacing: -0.5px; }
    .role-tag {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      background: var(--primary-accent); color: white; padding: 4px 10px; border-radius: 12px;
      letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    
    .nav-container { flex: 1; overflow-y: auto; padding: 0 16px 24px; }
    .nav-group { margin-top: 24px; }
    .group-title {
      font-size: 11px; font-weight: 700; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 1px;
      padding: 0 16px; margin-bottom: 12px;
    }
    
    .nav-list { padding: 0 !important; }
    .nav-item {
      height: 48px !important; border-radius: 16px !important; margin-bottom: 8px;
      color: var(--text-muted) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      mat-icon { font-size: 22px; width: 22px; height: 22px; margin-right: 14px; color: var(--text-muted); transition: all 0.3s; }
      span { font-size: 15px; font-weight: 500; font-family: 'Inter'; }
      
      border: 1px solid transparent;
      
      &:hover { 
        background: rgba(255, 255, 255, 0.4) !important; 
        color: var(--text-main) !important; 
        border: 1px solid var(--border-color);
        transform: translateX(4px);
      }
    }
    
    .active-link {
      background: var(--primary-gradient) !important;
      color: white !important; 
      box-shadow: var(--shadow-float);
      border: none !important;
      transform: translateX(4px);
      
      mat-icon { color: white !important; }
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
