export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'staff';
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface LoginParams {
    email: string;
    password?: string;
}

export interface RegisterParams {
    name: string;
    email: string;
    password?: string;
}
