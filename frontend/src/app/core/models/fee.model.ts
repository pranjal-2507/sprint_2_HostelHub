export interface Fee {
    id: string;
    student_id: string;
    amount: number;
    fee_type: string;
    due_date: string;
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    paid_at?: string;
    created_at: string;
}

export interface FeeResponse {
    id: string;
    student_id: string;
    student_name: string;
    room_number?: string;
    amount: number;
    fee_type: string;
    status: string;
    due_date: string;
    payment_date?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    fee_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    transaction_id?: string;
}
