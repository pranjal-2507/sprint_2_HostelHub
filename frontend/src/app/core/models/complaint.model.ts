export interface Complaint {
    id: string;
    student_id: string;
    student_name?: string;
    room_number?: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    resolved_at?: string;
}
