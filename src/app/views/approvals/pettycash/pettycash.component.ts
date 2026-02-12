import { Component } from '@angular/core';
import { TransactionlistComponent } from '../../financials/transactionlist/transactionlist.component';

@Component({
  selector: 'app-pettycash',
  imports: [TransactionlistComponent],
  templateUrl: './pettycash.component.html',
  styleUrl: './pettycash.component.scss',
})
export class PettycashComponent  {

  filterCriteria: string = 'pettycash';

}
