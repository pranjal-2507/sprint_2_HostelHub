import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './shared/services/theme.service';
import { LoadingBarComponent } from './shared/components/loading-bar.component';
import { LoadingService } from './core/services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingBarComponent],
  template: `
    <app-loading-bar></app-loading-bar>
    <router-outlet></router-outlet>
  `,
  styles: [`:host { display: block; }`],
})
export class App {
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  constructor(private themeService: ThemeService) {
    this.router.events.pipe(
      filter(event => 
        event instanceof NavigationStart || 
        event instanceof NavigationEnd || 
        event instanceof NavigationCancel || 
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.setLoading(true);
      } else {
        // Delay slightly for smooth transition
        setTimeout(() => this.loadingService.setLoading(false), 300);
      }
    });
  }
}
