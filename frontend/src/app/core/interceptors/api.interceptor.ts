import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Prepend base URL for relative URLs and ensure Content-Type is set for our API
    const isApiUrl = req.url.startsWith('http://localhost:8080') || !req.url.startsWith('http');
    
    if (isApiUrl) {
        const url = req.url.startsWith('http') ? req.url : `${environment.apiBaseUrl}${req.url}`;
        const token = localStorage.getItem('access_token');
        
        let headers = req.headers.set('Content-Type', 'application/json');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        const apiReq = req.clone({
            url: url,
            headers: headers,
        });
        return next(apiReq);
    }
    return next(req);
};
