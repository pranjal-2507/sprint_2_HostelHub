export interface OccupancyData {
    hostelName: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
}

export interface OccupancyTrend {
    date: string;
    occupancyRate: number;
}

export interface RoomUtilization {
    type: string;
    count: number;
    percentage: number;
}

export interface DashboardStats {
    totalHostels: number;
    availableRooms: number;
    activeMaintenanceRequests: number;
    visitorCheckinsToday: number;
}

export interface ActivityItem {
    id: string;
    type: 'room_allocation' | 'maintenance' | 'visitor' | 'payment' | 'general';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}
