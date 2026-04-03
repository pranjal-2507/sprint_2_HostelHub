import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-bar-wrapper" *ngIf="loadingService.loading$ | async">
      <div class="loading-bar"></div>
    </div>
  `,
  styles: [`
    .loading-bar-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 9999;
      background: transparent;
    }
    .loading-bar {
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #0ea5e9, #4f46e5);
      background-size: 200% auto;
      animation: loading 1.5s linear infinite;
      box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
    }
    @keyframes loading {
      0% { width: 0; left: 0; transform: translateX(-100%); }
      50% { width: 70%; transform: translateX(50%); }
      100% { width: 100%; transform: translateX(100%); }
    }
  `]
})
export class LoadingBarComponent {
  public loadingService = inject(LoadingService);
}
