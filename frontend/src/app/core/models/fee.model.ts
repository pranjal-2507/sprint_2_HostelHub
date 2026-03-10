export interface Fee {
    id: string;
    studentId: string;
    studentName: string;
    hostelId: string;
    roomNumber: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: string;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
    payments: Payment[];
}

export interface Payment {
    id: string;
    feeId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'online' | 'cheque' | 'upi';
    transactionId?: string;
    receiptUrl?: string;
}
