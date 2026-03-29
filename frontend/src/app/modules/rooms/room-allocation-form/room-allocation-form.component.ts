import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Room } from '../../../core/models';

@Component({
    selector: 'app-room-allocation-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
        MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule,
        MatNativeDateModule, MatIconModule,
    ],
    template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">meeting_room</mat-icon>
      Allocate Room
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="allocation-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select Room</mat-label>
          <mat-select formControlName="roomId">
            @for (room of data.rooms; track room.id) {
              <mat-option [value]="room.id">
                Room {{ room.room_number }} — {{ room.room_type | titlecase }} ({{ room.occupancy || 0 }}/{{ room.capacity }})
              </mat-option>
            }
          </mat-select>
          <mat-error>Room is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Student Name</mat-label>
          <input matInput formControlName="studentName" placeholder="Enter student name" />
          <mat-error>Student name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Student ID</mat-label>
          <input matInput formControlName="studentId" placeholder="Enter student ID" />
          <mat-error>Student ID is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Check-in Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="checkInDate" />
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error>Check-in date is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">
        Allocate
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    .title-icon {
      vertical-align: middle;
      margin-right: 8px;
      color: #7c4dff;
    }
    .allocation-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 8px;
    }
    .full-width { width: 100%; }
  `],
})
export class RoomAllocationFormComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<RoomAllocationFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { rooms: Room[] }
    ) {
        this.form = this.fb.group({
            roomId: ['', Validators.required],
            studentName: ['', Validators.required],
            studentId: ['', Validators.required],
            checkInDate: ['', Validators.required],
        });
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.dialogRef.close(this.form.value);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
