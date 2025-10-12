import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule, TableModule } from '@coreui/angular';

@Component({
  selector: 'app-job-charges',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  templateUrl: './jobcharges.component.html',
  styleUrls: ['./jobcharges.component.scss']
})
export class JobChargesComponent {
  
  get total(): number {
    return this.charges?.reduce((sum, c) => sum + c.amount, 0) || 0;
  }
  @Input() charges: Array<{ description: string; amount: number; type: string }> = [];
}
