import { Component } from '@angular/core';
import { TransactionlistComponent } from '../../../financials/transactionlist/transactionlist.component';

@Component({
  selector: 'app-waiting-for-ownership',
  imports: [TransactionlistComponent],
  templateUrl: './waiting-for-ownership.component.html',
  styleUrl: './waiting-for-ownership.component.scss',
})
export class WaitingForOwnershipComponent {

  filterCriteria: string = 'transactions_waiting_for_ownership';
}
