import { Routes } from '@angular/router';

export const complaintsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./complaint-list/complaint-list.component').then((m) => m.ComplaintListComponent),
    },
];
