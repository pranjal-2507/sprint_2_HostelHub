import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Prepend base URL for relative URLs and ensure Content-Type is set for our API
    const isApiUrl = req.url.startsWith('http://localhost:8080') || !req.url.startsWith('http');
    
    if (isApiUrl) {
        const url = req.url.startsWith('http') ? req.url : `${environment.apiBaseUrl}${req.url}`;
        const apiReq = req.clone({
            url: url,
            setHeaders: {
                'Content-Type': 'application/json',
            },
        });
        return next(apiReq);
    }
    return next(req);
};
