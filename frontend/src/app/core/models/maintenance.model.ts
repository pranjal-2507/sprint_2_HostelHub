export interface MaintenanceRequest {
    id: string;
    hostelId: string;
    roomId: string;
    roomNumber: string;
    title: string;
    description: string;
    category: 'plumbing' | 'electrical' | 'furniture' | 'cleaning' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    requestedBy: string;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    images?: string[];
    comments?: MaintenanceComment[];
}

export interface MaintenanceComment {
    id: string;
    author: string;
    message: string;
    createdAt: string;
}
