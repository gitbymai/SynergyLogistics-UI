// unauthorized.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <h1>403 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <button (click)="goToDashboard()">Go to Dashboard</button>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      text-align: center;
      padding: 50px;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}