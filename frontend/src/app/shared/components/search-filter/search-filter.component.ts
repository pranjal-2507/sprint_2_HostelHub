import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
    selector: 'app-search-filter',
    standalone: true,
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
    template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <mat-label>{{ placeholder }}</mat-label>
      <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" />
      <mat-icon matSuffix *ngIf="searchTerm" (click)="clear()" class="clear-icon">close</mat-icon>
    </mat-form-field>
  `,
    styles: [`
    .search-field {
      width: 100%;
      max-width: 400px;
    }
    .clear-icon {
      cursor: pointer;
      opacity: 0.6;
      &:hover { opacity: 1; }
    }
  `],
})
export class SearchFilterComponent implements OnInit, OnDestroy {
    @Input() placeholder = 'Search...';
    @Input() debounce = 300;
    @Output() searchChange = new EventEmitter<string>();

    searchTerm = '';
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.searchSubject
            .pipe(debounceTime(this.debounce), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((value) => this.searchChange.emit(value));
    }

    onSearch(value: string): void {
        this.searchSubject.next(value);
    }

    clear(): void {
        this.searchTerm = '';
        this.searchSubject.next('');
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
