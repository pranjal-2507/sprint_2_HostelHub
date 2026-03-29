export interface Student {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hosteler';
    phone?: string;
    course?: string;
    year?: number;
    room_number?: string;
    created_at?: string;
}
