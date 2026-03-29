import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse, LoginParams, RegisterParams, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/auth';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.restoreUser();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    /** Restore user from localStorage on app start */
    private restoreUser(): void {
        const stored = localStorage.getItem('current_user');
        if (stored && this.getToken()) {
            try {
                const user = JSON.parse(stored) as User;
                this.currentUserSubject.next(user);
            } catch {
                this.logout();
            }
        }
    }

    login(params: LoginParams): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, params).pipe(
            tap(response => {
                this.setToken(response.access_token);
                this.setUser(response.user);
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
            tap(user => this.setUser(user)),
            catchError(this.handleError)
        );
    }

    getHostelerDashboardData(): Observable<any> {
        return this.http.get<any>(`http://localhost:8080/api/hosteler/dashboard`).pipe(
            catchError(this.handleError)
        );
    }

    getAdminDashboardData(): Observable<any> {
        return this.http.get<any>(`http://localhost:8080/api/admin/dashboard/stats`).pipe(
            catchError(this.handleError)
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    setToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    private setUser(user: User): void {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getUserRole(): 'admin' | 'hosteler' | null {
        return this.currentUserValue?.role || null;
    }

    isAdmin(): boolean {
        return this.getUserRole() === 'admin';
    }

    isHosteler(): boolean {
        return this.getUserRole() === 'hosteler';
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
