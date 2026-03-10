import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'statusBadge',
    standalone: true,
})
export class StatusBadgePipe implements PipeTransform {
    transform(status: string): string {
        const statusMap: Record<string, string> = {
            available: 'badge-success',
            occupied: 'badge-info',
            maintenance: 'badge-warning',
            reserved: 'badge-accent',
            pending: 'badge-warning',
            'in-progress': 'badge-info',
            resolved: 'badge-success',
            rejected: 'badge-danger',
            paid: 'badge-success',
            partial: 'badge-warning',
            overdue: 'badge-danger',
            'checked-in': 'badge-info',
            'checked-out': 'badge-success',
            low: 'badge-success',
            medium: 'badge-warning',
            high: 'badge-danger',
            urgent: 'badge-danger',
        };
        return statusMap[status?.toLowerCase()] || 'badge-default';
    }
}
