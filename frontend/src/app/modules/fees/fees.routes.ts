import { Routes } from '@angular/router';

export const feesRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./fee-dashboard/fee-dashboard.component').then((m) => m.FeeDashboardComponent),
    },
    {
        path: 'history',
        loadComponent: () =>
            import('./payment-history/payment-history.component').then((m) => m.PaymentHistoryComponent),
    },
];
