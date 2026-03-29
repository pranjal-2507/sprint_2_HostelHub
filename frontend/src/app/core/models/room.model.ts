export interface Room {
    id: string;
    room_number: string;
    floor: number;
    capacity: number;
    occupancy: number; // mapped from 'occupied' in backend
    room_type: string;
    rent: number;
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    created_at: string;
}

export interface RoomAllocation {
    roomId: string;
    studentId: string;
    studentName: string;
    roomNumber: string;
    checkInDate: string;
    checkOutDate?: string;
}
