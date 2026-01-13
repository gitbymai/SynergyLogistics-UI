import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ResourceTransaction,
  NewResourceTransaction,
  UpdateResourceTransaction,
} from '../../../models/resource';
import { ResourceService } from '../../../services/resource/resource.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-credit-transaction-lists',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './credit-transaction-lists.component.html',
  styleUrl: './credit-transaction-lists.component.scss',
})
export class CreditTransactionListsComponent implements OnInit {
  transactionForm!: FormGroup;
  transactions: ResourceTransaction[] = [];
  filteredTransactions: ResourceTransaction[] = [];

  showTransactionModal = false;
  showDetailsModal = false;
  isSubmitting = false;
  isLoading = false;

  // Resource Info from Query Params
  resourceId: number = 0;
  resourceGuid: string = '';
  resourceName: string = '';
  currentBalance: number = 0;

  // Selected Transaction for edit/delete/view
  selectedTransaction: ResourceTransaction | null = null;

  // Transaction Types (You'll need to load these from your service/options)
  transactionTypes: Array<{ id: number; name: string }> = [
    { id: 1, name: 'Credit' },
    { id: 2, name: 'Debit' },
    { id: 3, name: 'Adjustment' },
    { id: 4, name: 'Refund' }
  ];

  // Debit transaction type IDs (customize based on your actual IDs)
  debitTransactionTypeIds: number[] = [2]; // Adjust based on your actual debit type IDs

  // Filters
  selectedTransactionType: string = '';
  filterFromDate: string = '';
  filterToDate: string = '';

  // Toast Notifications
  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: ResourceService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.resourceId = +params['resourceId'] || 0;
      this.resourceGuid = params['guid'] || '';

      if (this.resourceId) {
        this.loadTransactions();
        this.loadResourceDetails();
      } else {
        this.showError('Invalid resource');
        this.goBack();
      }
    });
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      optionResourceTransactionTypeId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01), Validators.max(9999999999999999.99)]],
      referenceNumber: ['', [Validators.maxLength(50)]],
      notes: ['', [Validators.maxLength(1000)]],
      isActive: [true]
    });
  }

  loadResourceDetails(): void {
    // TODO: Load resource details to get resource name and current balance
    // For now, using mock data
    this.resourceName = 'Synergy Logistics Application';
    this.currentBalance = 5000.00;
  }

  loadTransactions(): void {
    this.isLoading = true;

    this.transactionService.getResourceTransactionsByResourceId(this.resourceId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.transactions = response.data;
          this.filteredTransactions = [...this.transactions];
          this.totalItems = this.transactions.length;
          
          if (this.transactions.length > 0) {
            const latestTransaction = this.transactions[0];
            this.currentBalance = latestTransaction.balanceAfter;
          }
        } else {
          this.showError(response.message || 'Failed to load transactions');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.showError('Failed to load transactions. Please try again.');
        this.isLoading = false;
      }
    });
  }

  openNewTransactionModal(): void {
    this.selectedTransaction = null;
    this.transactionForm.reset({ isActive: true });
    this.transactionForm.get('optionResourceTransactionTypeId')?.enable();
    this.transactionForm.get('amount')?.enable();
    this.showTransactionModal = true;
  }


  viewTransactionDetails(transaction: ResourceTransaction): void {
    this.selectedTransaction = transaction;
    this.showDetailsModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.transactionForm.reset();
    this.selectedTransaction = null;
    this.transactionForm.get('optionResourceTransactionTypeId')?.enable();
    this.transactionForm.get('amount')?.enable();
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTransaction = null;
  }

  submitTransactionForm(): void {
    if (!this.transactionForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

      this.createTransaction();
  }

  createTransaction(): void {
    const createRequest: NewResourceTransaction = {
      resourceId: this.resourceId,
      optionResourceTransactionTypeId: this.transactionForm.value.optionResourceTransactionTypeId,
      amount: this.transactionForm.value.amount,
      referenceNumber: this.transactionForm.value.referenceNumber || null,
      notes: this.transactionForm.value.notes || null
    };

    this.transactionService.addResourceTransaction(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.transactions.unshift(response.data); // Add to beginning
            this.showSuccess('Transaction created successfully');
            this.closeTransactionModal();
            
            // Update current balance
            this.currentBalance = response.data.balanceAfter;
          } else {
            this.showError(response.message || 'Failed to create transaction');
          }
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.showError(error?.error?.message || 'Failed to create transaction');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/credit-management-list']);
  }

  // Helper Methods
  isDebitTransaction(transactionTypeId: number): boolean {
    return this.debitTransactionTypeIds.includes(transactionTypeId);
  }

  // Summary Calculations
  getTotalCredits(): number {
    return this.filteredTransactions
      .filter(t => !this.isDebitTransaction(t.optionResourceTransactionTypeId) && t.isActive)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  getTotalDebits(): number {
    return this.filteredTransactions
      .filter(t => this.isDebitTransaction(t.optionResourceTransactionTypeId) && t.isActive)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  // Pagination Methods
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  getPagedTransactions(): ResourceTransaction[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTransactions.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Toast Notifications
  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 4000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 4000);
  }
}