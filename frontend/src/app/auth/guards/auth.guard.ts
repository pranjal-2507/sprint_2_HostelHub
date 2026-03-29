import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Requires authentication */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }
    return router.createUrlTree(['/login']);
};

/** Requires admin role */
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }
    if (authService.isAdmin()) {
        return true;
    }
    // Non-admin → redirect to hosteler dashboard
    return router.createUrlTree(['/hosteler/dashboard']);
};

/** Requires hosteler role */
export const hostelerGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }
    if (authService.isHosteler()) {
        return true;
    }
    // Non-hosteler → redirect to admin dashboard
    return router.createUrlTree(['/admin/dashboard']);
};

/** Only for non-authenticated users (login/signup pages) */
export const guestGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        // Redirect based on role
        const role = authService.getUserRole();
        if (role === 'admin') {
            return router.createUrlTree(['/admin/dashboard']);
        }
        return router.createUrlTree(['/hosteler/dashboard']);
    }

    return true;
};
