import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<'light' | 'dark' | 'auto'>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | 'auto';
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: 'light' | 'dark' | 'auto') {
    this.themeSubject.next(theme);
    localStorage.setItem('app-theme', theme);
    
    let actualTheme = theme;
    if (theme === 'auto') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (actualTheme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  get currentTheme() {
    return this.themeSubject.value;
  }
}
