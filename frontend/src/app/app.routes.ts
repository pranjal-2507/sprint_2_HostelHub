import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { authGuard, guestGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard]
    },
    {
        path: 'signup',
        component: SignupComponent,
        canActivate: [guestGuard]
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./modules/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
            },
            {
                path: 'rooms',
                loadChildren: () =>
                    import('./modules/rooms/rooms.routes').then((m) => m.roomsRoutes),
            },
            {
                path: 'maintenance',
                loadChildren: () =>
                    import('./modules/maintenance/maintenance.routes').then((m) => m.maintenanceRoutes),
            },
            {
                path: 'fees',
                loadChildren: () =>
                    import('./modules/fees/fees.routes').then((m) => m.feesRoutes),
            },
            {
                path: 'visitors',
                loadChildren: () =>
                    import('./modules/visitors/visitors.routes').then((m) => m.visitorsRoutes),
            },
            {
                path: 'analytics',
                loadChildren: () =>
                    import('./modules/analytics/analytics.routes').then((m) => m.analyticsRoutes),
            },
        ],
    },
    { path: '**', redirectTo: 'dashboard' },
];
