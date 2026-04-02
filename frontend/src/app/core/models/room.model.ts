export interface Room {
    id: string;
    hostel_id?: string;
    room_number: string;
    floor: number;
    capacity: number;
    occupancy: number; 
    room_type: string;
    price_per_month: number;
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
