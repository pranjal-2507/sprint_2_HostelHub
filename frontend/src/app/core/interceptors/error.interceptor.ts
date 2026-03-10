import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackBar = inject(MatSnackBar);

    return next(req).pipe(
        catchError((error) => {
            let message = 'An unexpected error occurred';

            switch (error.status) {
                case 0:
                    message = 'Unable to connect to the server';
                    break;
                case 400:
                    message = error.error?.message || 'Bad request';
                    break;
                case 401:
                    message = 'Unauthorized. Please log in again.';
                    break;
                case 403:
                    message = 'You do not have permission to perform this action';
                    break;
                case 404:
                    message = 'Resource not found';
                    break;
                case 500:
                    message = 'Internal server error. Please try again later.';
                    break;
            }

            snackBar.open(message, 'Dismiss', {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
            });

            return throwError(() => error);
        })
    );
};
