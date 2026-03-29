import { Routes } from '@angular/router';

export const studentsRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./student-list/student-list.component').then((m) => m.StudentListComponent),
    },
    {
        path: ':id',
        loadComponent: () =>
            import('./student-detail/student-detail.component').then((m) => m.StudentDetailComponent),
    },
];
