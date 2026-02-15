import { Component } from '@angular/core';
import { TransactionlistComponent } from '../../../financials/transactionlist/transactionlist.component';

@Component({
  selector: 'app-owned-transactions',
  imports: [TransactionlistComponent],
  templateUrl: './owned-transactions.component.html',
  styleUrl: './owned-transactions.component.scss',
})
export class OwnedTransactionsComponent {

  filterCriteria: string = 'transactions_owned_by_user';

}
