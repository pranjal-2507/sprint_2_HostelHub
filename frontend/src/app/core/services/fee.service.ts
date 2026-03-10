import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fee, Payment } from '../models';

@Injectable({ providedIn: 'root' })
export class FeeService {
    private readonly apiUrl = '/api/fees';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Fee[]> {
        return this.http.get<Fee[]>(this.apiUrl);
    }

    getByStudentId(studentId: string): Observable<Fee[]> {
        return this.http.get<Fee[]>(`${this.apiUrl}/${studentId}`);
    }

    getById(id: string): Observable<Fee> {
        return this.http.get<Fee>(`${this.apiUrl}/detail/${id}`);
    }

    create(fee: Partial<Fee>): Observable<Fee> {
        return this.http.post<Fee>(this.apiUrl, fee);
    }

    update(id: string, fee: Partial<Fee>): Observable<Fee> {
        return this.http.put<Fee>(`${this.apiUrl}/${id}`, fee);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    recordPayment(feeId: string, payment: Partial<Payment>): Observable<Payment> {
        return this.http.post<Payment>(`${this.apiUrl}/${feeId}/payments`, payment);
    }

    getPaymentHistory(studentId: string): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/${studentId}/payments`);
    }
}
