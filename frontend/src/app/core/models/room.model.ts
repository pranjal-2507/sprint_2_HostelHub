export interface Room {
    id: string;
    hostelId: string;
    roomNumber: string;
    floor: number;
    capacity: number;
    occupancy: number;
    type: 'single' | 'double' | 'triple' | 'dormitory';
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    amenities: string[];
    pricePerMonth: number;
    allocatedStudents: string[];
    createdAt: string;
    updatedAt: string;
}

export interface RoomAllocation {
    roomId: string;
    studentId: string;
    studentName: string;
    checkInDate: string;
    checkOutDate?: string;
}
