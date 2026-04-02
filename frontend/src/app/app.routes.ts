import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { dashboardResolver } from './core/resolvers/dashboard.resolver';
import { roomResolver } from './core/resolvers/room.resolver';

export const routes: Routes = [
    // Auth routes
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
    },
    
    // Admin dashboard & modules
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard('admin')],
        loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent),
                resolve: { dashboardData: dashboardResolver }
            },
            {
                path: 'rooms',
                loadChildren: () => import('./modules/rooms/rooms.routes').then(m => m.roomsRoutes)
            },
            {
                path: 'students',
                loadChildren: () => import('./modules/students/students.routes').then(m => m.studentsRoutes)
            },
            {
                path: 'fees',
                loadChildren: () => import('./modules/fees/fees.routes').then(m => m.feesRoutes)
            },
            {
                path: 'complaints',
                loadChildren: () => import('./modules/complaints/complaints.routes').then(m => m.complaintsRoutes)
            },
            {
                path: 'notices',
                loadChildren: () => import('./modules/notices/notices.routes').then(m => m.noticesRoutes)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    // Hosteler dashboard
    {
        path: 'hosteler',
        canActivate: [authGuard, roleGuard('hosteler')],
        loadComponent: () => import('./layout/hosteler-layout/hosteler-layout.component').then(m => m.HostelerLayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/hosteler/dashboard/hosteler-dashboard.component').then(m => m.HostelerDashboardComponent),
                resolve: { dashboardData: dashboardResolver }
            },
            {
                path: 'my-room',
                loadComponent: () => import('./modules/hosteler/my-room/my-room.component').then(m => m.MyRoomComponent),
                resolve: { roomInfo: roomResolver }
            },
            {
                path: 'payments',
                loadComponent: () => import('./modules/hosteler/payments/hosteler-payments.component').then(m => m.HostelerPaymentsComponent)
            },
            {
                path: 'complaints',
                loadComponent: () => import('./modules/hosteler/complaints/hosteler-complaints.component').then(m => m.HostelerComplaintsComponent)
            },
            {
                path: 'notices',
                loadComponent: () => import('./modules/hosteler/notices/hosteler-notices.component').then(m => m.HostelerNoticesComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./modules/hosteler/profile/hosteler-profile.component').then(m => m.HostelerProfileComponent)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    
    // Default route - redirect to login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
