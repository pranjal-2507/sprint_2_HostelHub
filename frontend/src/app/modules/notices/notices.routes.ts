import { Routes } from '@angular/router';

export const noticesRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./notice-list/notice-list.component').then((m) => m.NoticeListComponent),
    },
];
