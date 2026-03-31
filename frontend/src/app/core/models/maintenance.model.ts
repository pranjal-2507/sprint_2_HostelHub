export interface MaintenanceRequest {
    id: string;
    room_id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    created_at: string;
}

export interface MaintenanceResponse {
    id: string;
    room_id: string;
    room_number: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    created_at: string;
}

export interface MaintenanceComment {
    id: string;
    author: string;
    message: string;
    createdAt: string;
}
