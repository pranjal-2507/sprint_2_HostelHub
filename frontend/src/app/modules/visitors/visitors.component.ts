import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { VisitorCheckinFormComponent } from './visitor-checkin-form/visitor-checkin-form.component';
import { VisitorLogTableComponent } from './visitor-log-table/visitor-log-table.component';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [CommonModule, MatTabsModule, VisitorCheckinFormComponent, VisitorLogTableComponent],
  template: `
    <div class="visitors-page">
      <h1 class="page-title">Visitor Management</h1>
      <mat-tab-group animationDuration="200ms">
        <mat-tab label="Visitor Log"><div class="tab-body"><app-visitor-log-table></app-visitor-log-table></div></mat-tab>
        <mat-tab label="Check In"><div class="tab-body"><app-visitor-checkin-form></app-visitor-checkin-form></div></mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`.visitors-page { max-width: 1200px; } .page-title { font-size: 22px; font-weight: 600; color: #1e293b; margin: 0 0 20px; } .tab-body { padding-top: 20px; }`],
})
export class VisitorsComponent { }
