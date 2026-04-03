import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { tap, map, catchError, of } from 'rxjs';

export const roleGuard = (requiredRole: string) => {
    return () => {
        const router = inject(Router);
        const authService = inject(AuthService);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            router.navigate(['/login']);
            return false;
        }

        return authService.getCurrentUser().pipe(
            map(user => {
                if (user && user.role === requiredRole) {
                    return true;
                }
                
                // If they have wrong role, boot them to their designated dashboard
                if (user && user.role === 'admin') {
                    router.navigate(['/admin/dashboard']);
                } else if (user) {
                    router.navigate(['/hosteler/dashboard']);
                } else {
                    router.navigate(['/login']);
                }
                return false;
            }),
            catchError(() => {
                router.navigate(['/login']);
                return of(false);
            })
        );
    };
};
