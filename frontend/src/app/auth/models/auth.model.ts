export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hosteler';
    phone?: string;
    course?: string;
    year?: number;
    roomNumber?: string;
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
