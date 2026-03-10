import { Routes } from '@angular/router';

export const visitorsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./visitors.component').then((m) => m.VisitorsComponent),
    },
];
