import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule, TableModule } from '@coreui/angular';
import { ChargeTransaction } from '../../../models/chargetransaction';

@Component({
  selector: 'app-job-charges',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, RouterLink],
  templateUrl: './jobcharges.component.html',
  styleUrls: ['./jobcharges.component.scss']
})
export class JobChargesComponent {

get total(): number {
  const excludedStatuses = ['CANCELLED', 'REJECTED'];
  return this.charges
    .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
    .reduce((sum, charge) => sum + (charge.amount || 0), 0);
}
  @Input() jobGuid: string = ''; // Add this Input
  @Input() charges: ChargeTransaction[] = [];


  onManageCharges() {
    console.log('Manage charges clicked');
  }

    getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bi-check-circle';
      case 'PENDING': return 'bi-clock';
      case 'CANCELLED': return 'bi-x-circle';
      case 'COMPLETED': return 'bi-check-all';
      default: return 'bi-question-circle';
    }
  }
}