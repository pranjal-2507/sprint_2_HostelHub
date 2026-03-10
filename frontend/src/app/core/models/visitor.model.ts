export interface Visitor {
    id: string;
    hostelId: string;
    visitorName: string;
    visitorPhone: string;
    visitorEmail?: string;
    purpose: string;
    visitingStudent: string;
    roomNumber: string;
    checkInTime: string;
    checkOutTime?: string;
    idProofType: string;
    idProofNumber: string;
    status: 'checked-in' | 'checked-out';
}
