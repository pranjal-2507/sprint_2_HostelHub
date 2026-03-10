import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div class="loading-overlay" *ngIf="isLoading">
      <mat-spinner [diameter]="diameter" [color]="'primary'"></mat-spinner>
      <p class="loading-text" *ngIf="message">{{ message }}</p>
    </div>
  `,
    styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      gap: 16px;
    }
    .loading-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin: 0;
    }
  `],
})
export class LoadingSpinnerComponent {
    @Input() isLoading = true;
    @Input() diameter = 48;
    @Input() message?: string;
}
