export interface Notice {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'event' | 'rules' | 'emergency' | 'maintenance';
    priority: 'low' | 'medium' | 'high';
    created_by: string;
    created_at: string;
    is_bookmarked?: boolean;
}
