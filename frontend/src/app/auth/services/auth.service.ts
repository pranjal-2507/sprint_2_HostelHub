import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, LoginParams, RegisterParams, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Use localhost:8080 per requirements for Rust backend
    private apiUrl = 'http://localhost:8080/auth';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.checkInitialAuth();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    private checkInitialAuth(): void {
        if (this.getToken()) {
            this.getCurrentUser().subscribe({
                error: () => this.logout()
            });
        }
    }

    login(params: LoginParams): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, params).pipe(
            tap(response => {
                this.setToken(response.access_token);
                this.currentUserSubject.next(response.user);
            }),
            catchError(this.handleError)
        );
    }

    register(params: RegisterParams): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, params).pipe(
            catchError(this.handleError)
        );
    }

    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => this.currentUserSubject.next(user)),
            catchError(this.handleError)
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    setToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private handleError(error: any) {
        let errorMessage = 'An error occurred during authentication.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else if (error.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else if (error.status) {
            errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}
