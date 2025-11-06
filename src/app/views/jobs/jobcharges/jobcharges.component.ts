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
    return this.charges?.reduce((sum, charge) => sum + (charge.amount || 0), 0) || 0;
  }
  @Input() jobGuid: string = ''; // Add this Input
  @Input() charges: ChargeTransaction[] = [];


  onManageCharges() {
    console.log('Manage charges clicked');
  }
}
