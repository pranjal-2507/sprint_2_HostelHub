import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, SidebarComponent, NavbarComponent],
  template: `
    <div class="layout-container">
      <app-navbar (toggleSidebar)="sidenav.toggle()"></app-navbar>
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav glass-panel">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container { display: flex; flex-direction: column; height: 100vh; background: transparent; }
    .sidenav-container { flex: 1; background: transparent; padding: 16px; overflow: hidden; }
    .sidenav { width: 260px; background: transparent; border: none; margin-right: 24px; border-radius: 24px; overflow: hidden; }
    .main-content { background: transparent; border-radius: 24px; overflow-y: auto; }
    .content-wrapper { padding: 8px 16px; min-height: calc(100vh - 100px); }
    @media (max-width: 768px) { .sidenav-container { padding: 8px; } .sidenav { margin-right: 0; } .content-wrapper { padding: 8px; } }
  `],
})
export class MainLayoutComponent { }
