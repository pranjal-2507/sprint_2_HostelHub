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
        <mat-sidenav #sidenav mode="side" opened class="sidenav"
                     [fixedInViewport]="true" [fixedTopGap]="56">
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
    .layout-container { display: flex; flex-direction: column; height: 100vh; }
    .sidenav-container { flex: 1; }
    .sidenav { width: 240px; background: #fff; border-right: 1px solid #f1f5f9; }
    .main-content { background: #f8f9fb; }
    .content-wrapper { padding: 28px 32px; min-height: calc(100vh - 56px); }
    @media (max-width: 768px) { .content-wrapper { padding: 16px; } }
  `],
})
export class MainLayoutComponent { }
