import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Only prepend base URL for relative URLs
    if (!req.url.startsWith('http')) {
        const apiReq = req.clone({
            url: `${environment.apiBaseUrl}${req.url}`,
            setHeaders: {
                'Content-Type': 'application/json',
            },
        });
        return next(apiReq);
    }
    return next(req);
};
