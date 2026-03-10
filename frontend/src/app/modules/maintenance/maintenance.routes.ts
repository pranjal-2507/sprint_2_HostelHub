import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./maintenance-list/maintenance-list.component').then((m) => m.MaintenanceListComponent),
    },
];
