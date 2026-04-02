import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
    // Standard proxy approach for relative URLs (/api, /auth)
    // We only attach the token here. The proxy handles the base URL.
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
    }

    return next(req);
};
