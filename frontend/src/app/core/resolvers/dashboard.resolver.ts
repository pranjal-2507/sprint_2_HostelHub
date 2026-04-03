import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { catchError, of } from 'rxjs';

/** Pre-fetches dashboard data before route activation to ensure instant pop-in */
export const dashboardResolver: ResolveFn<any> = (route, state) => {
    const authService = inject(AuthService);
    const role = authService.getUserRole();

    if (role === 'admin') {
        return authService.getAdminDashboardData().pipe(
            catchError(() => of(null))
        );
    } else {
        return authService.getHostelerDashboardData().pipe(
            catchError(() => of(null))
        );
    }
};
