import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Configuration } from '../../../models/configuration';
import { IctsiTransaction, NewIctsiTransaction, UpdateIctsiTransaction } from '../../../models/ictsi';
import { IctsiService } from '../../../services/ictsi/ictsi.service';
import { Job } from '../../../models/job';
import { JobsService } from '../../../services/jobs/jobs.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-ictsi-transaction-lists',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './ictsi-transaction-lists.component.html',
  styleUrl: './ictsi-transaction-lists.component.scss',
})
export class IctsiTransactionListsComponent implements OnInit {

  transactionForm!: FormGroup;
  editTransactionForm!: FormGroup;
  cancelTransactionForm!: FormGroup;
  transactions: IctsiTransaction[] = [];
  filteredTransactions: IctsiTransaction[] = [];

  showTransactionModal = false;
  showCancelTransactionModal = false;
  showDetailsModal = false;
  showEditTransactionModal = false;
  isSubmitting = false;
  isLoading = false;

  // Resource Info from Query Params
  ictsiId: number = 0;
  ictsiGuid: string = '';
  ictsiName: string = '';
  currentBalance: number = 0;

  // Selected Transaction for edit/delete/view
  selectedTransaction: IctsiTransaction | null = null;

  // Transaction Types (You'll need to load these from your service/options)
  transactionTypes: Configuration[] = [];

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

  jobCodeSearch = '';
  jobCodeDropdownOpen = false;
  allJobs: Job[] = [];
  filteredJobs: Job[] = [];
  selectedJob: Job | null = null;

  debitTypeId: number = 1;


  showFilters: boolean = false;

  filters = {
    dateFrom: '',
    dateTo: ''
  };

  maxDateTo: string = '';
  dateRangeError: boolean = false;


  userRole: string = "";

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: IctsiService,
    private jobService: JobsService,
    private authService: AuthService
  ) {
    this.initializeForm();
    this.initializeEditTransactionForm();
  }

  ngOnInit(): void {
    
    this.userRole = this.authService.getCurrentUserRole() || '';

    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.ictsiId = +params['ictsiId'] || 0;
      this.ictsiGuid = params['guid'] || '';

      if (this.ictsiId) {
        this.loadTransactions();
        this.loadResourceDetails();
        this.loadTransactionTypes();
        this.loadJobs();
      } else {
        this.showError('Invalid resource');
        this.goBack();
      }
    });
  }

  initializeForm(): void {
    this.transactionForm = this.fb.group({
      optionIctsiTransactionTypeId: ['', [Validators.required]],
      jobCode: [''],
      amount: ['', [Validators.required, Validators.min(-9999999999999999.99), Validators.max(9999999999999999.99)]],
      referenceNumber: ['', [Validators.maxLength(50)]],
      notes: ['', [Validators.maxLength(1000)]],
      isActive: [true],
      isReimbursement: [false]
    });

    this.cancelTransactionForm = this.fb.group({
      cancellationReason: ['', [Validators.required]]
    });

  }

  initializeEditTransactionForm() {
    this.editTransactionForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  loadJobs(): void {
    this.jobService.getAllJobFromLast6Months().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allJobs = response.data.filter(x => x.isActive === true);
          this.filteredJobs = [...this.allJobs];
        } else {
          this.showError(response.message || 'Failed to load job codes');
        }
      },
      error: (error) => {
        console.error('Error loading job codes:', error);
        this.showError('Failed to load job codes. Please try again.');
      }
    });
  }

  onJobCodeSearchChange(searchValue: string): void {
    this.jobCodeSearch = searchValue;
    this.jobCodeDropdownOpen = true;

    if (!searchValue.trim()) {
      this.filteredJobs = [...this.allJobs];
      return;
    }

    const searchLower = searchValue.toLowerCase();
    this.filteredJobs = this.allJobs.filter(jobCode =>
      jobCode.jobCode.toLowerCase().includes(searchLower)
    );
  }

  selectJobCode(job: Job): void {
    this.selectedJob = job;
    this.jobCodeSearch = `${job.jobCode}`;
    this.transactionForm.patchValue({ jobCode: job.jobId });
    this.jobCodeDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.jobCodeDropdownOpen) {
      return; // Exit early if dropdown is already closed
    }

    const target = event.target as HTMLElement;

    const clickedInsideDropdown = target.closest('.jobcode-dropdown');

    if (!clickedInsideDropdown) {
      this.jobCodeDropdownOpen = false;
    }
  }

  loadTransactionTypes(): void {
    this.transactionService.getResourceTransactionTypes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.transactionTypes = response.data.filter(x => x.isActive === true)
        } else {
          this.showError(response.message || 'Failed to load transaction types');
        }
      },
      error: (error) => {
        console.error('Error loading transaction types:', error);
        this.showError('Failed to load transaction types. Please try again.');
      }
    });

  }

  loadTransactions(): void {
    this.isLoading = true;

    this.transactionService.getIctsiTransactionsByIctsiId(this.ictsiId, this.filters.dateFrom, this.filters.dateTo).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.transactions = response.data;
          this.filteredTransactions = [...this.transactions];
          this.totalItems = this.transactions.length;

          console.log('Loaded transactions:', this.transactions);
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

  submitTransactionForm(): void {
    if (!this.transactionForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    this.createTransaction();
  }

  createTransaction(): void {
    const createRequest: NewIctsiTransaction = {
      ictsiId: this.ictsiId,
      optionIctsiTransactionTypeId: this.transactionForm.value.optionIctsiTransactionTypeId,
      amount: this.transactionForm.value.amount,
      referenceNumber: this.transactionForm.value.referenceNumber || null,
      notes: this.transactionForm.value.notes || null,
      jobId: this.transactionForm.value.jobCode,
      isReimbursement: this.transactionForm.value.isReimbursement
    };

    this.transactionService.addIctsiTransaction(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.transactions.unshift(response.data);
            this.showSuccess('Transaction created successfully');
            this.closeTransactionModal();

            this.loadTransactions();
            this.loadResourceDetails();

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

  loadResourceDetails(): void {

    this.transactionService.getIctsiByGuid(this.ictsiGuid).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.ictsiName = response.data.ictsiName || 'N/A';
          this.currentBalance = response.data.currentAmount || 0;

        } else {
          this.showError(response.message || 'Failed to load record details');
        }
      },
      error: (error) => {
        console.error('Error loading record details:', error);
        this.showError('Failed to load record details. Please try again.');
      }
    });

  }

  getTransactionTypeById(id: number): Configuration | undefined {
    return this.transactionTypes.find(type => type.optionId === id);
  }

  openNewTransactionModal(): void {
    this.selectedTransaction = null;
    this.transactionForm.reset({ isActive: true, isReimbursement: false });
    this.transactionForm.get('optionIctsiTransactionTypeId')?.enable();
    this.transactionForm.get('amount')?.enable();
    this.jobCodeSearch = '';
    this.selectedJob = null;
    this.filteredJobs = [...this.allJobs];
    this.jobCodeDropdownOpen = false;
    this.showTransactionModal = true;
  }

  viewTransactionDetails(transaction: IctsiTransaction): void {
    this.selectedTransaction = transaction;
    this.showDetailsModal = true;
  }

  openEditTransactionModal(transaction: IctsiTransaction): void {
    this.selectedTransaction = transaction;
    this.editTransactionForm.patchValue({
      amount: transaction.amount
    });
    this.showEditTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.transactionForm.reset();
    this.selectedTransaction = null;
    this.transactionForm.get('optionIctsiTransactionTypeId')?.enable();
    this.transactionForm.get('amount')?.enable();
    this.jobCodeSearch = '';
    this.selectedJob = null;
    this.filteredJobs = [...this.allJobs];
    this.jobCodeDropdownOpen = false;
  }

  closeEditTransactionModal() {
    this.showEditTransactionModal = false;
    this.editTransactionForm.reset();
    this.selectedTransaction = null;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTransaction = null;
  }

  submitEditTransactionForm() {
    if (this.editTransactionForm.valid && this.selectedTransaction) {
      this.isSubmitting = true;

      const updatedAmount = this.editTransactionForm.get('amount')?.value;

    }
  }

  openCancelTransactionModal(transaction: IctsiTransaction) {
    this.selectedTransaction = transaction;
    this.cancelTransactionForm.reset();
    this.showCancelTransactionModal = true;
  }

  closeCancelTransactionModal() {
    this.showCancelTransactionModal = false;
    this.cancelTransactionForm.reset();
  }

  submitCancelTransactionForm() {
    if (this.cancelTransactionForm.invalid) return;

    const cancellationReason = this.cancelTransactionForm.get('cancellationReason')?.value;

    this.isSubmitting = true;

    this.transactionService.cancelIctsiTransaction(this.selectedTransaction!.ictsiTransactionGuid, cancellationReason)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.transactions.unshift(response.data);
            this.showSuccess('Transaction cancelled successfully');
            this.closeCancelTransactionModal();

            this.loadTransactions();
            this.loadResourceDetails();

          } else {
            this.showError(response.message || 'Failed to cancel transaction');
          }
        },
        error: (error) => {
          console.error('Error cancelling transaction:', error);
          this.showError(error?.error?.message || 'Failed to cancel transaction');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/financial/ictsi-management-list']);
  }

  isDebitTransaction(transactionTypeId: number): boolean {
    const transactionType = this.transactionTypes.find(type => type.optionId === transactionTypeId);
    return transactionType ? transactionType.value === 'DEBIT' : false;
  }

  getTotalCredits(): number {
    return this.filteredTransactions
      .filter(t => !this.isDebitTransaction(t.optionIctsiTransactionTypeId) && t.isActive)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  getTotalDebits(): number {
    return this.filteredTransactions
      .filter(t => this.isDebitTransaction(t.optionIctsiTransactionTypeId) && t.isActive && t.ictsiTransactionStatusName !== 'CANCELLED')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  isDebitSelected(): boolean {
    const selectedTypeId = this.transactionForm.get('optionIctsiTransactionTypeId')?.value;

    if (!selectedTypeId) {
      return false;
    }

    // Use your existing isDebitTransaction method
    return this.isDebitTransaction(Number(selectedTypeId));
  }

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

  getPagedTransactions(): IctsiTransaction[] {
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

  clearFilters(): void {
    this.filters = { dateFrom: '', dateTo: '' };
    this.filteredTransactions = [...this.transactions];
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters.dateFrom !== '' ||
      this.filters.dateTo !== '';
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    return count;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  generateReport(): void {
    if (!this.filters.dateFrom || !this.filters.dateTo) {
      alert('Please select both a Date From and Date To before generating.');
      return;
    }

    this.isLoading = true;
    this.transactions = [];
    this.filteredTransactions = [];

    this.transactionService.getIctsiTransactionsByIctsiId(this.ictsiId, this.filters.dateFrom, this.filters.dateTo).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.transactions = response.data;
          this.filteredTransactions = [...this.transactions];
          this.totalItems = this.transactions.length;

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

  onDateFromChange(): void {
    this.dateRangeError = false;

    if (this.filters.dateFrom) {
      const from = new Date(this.filters.dateFrom);
      const max = new Date(from);
      max.setMonth(max.getMonth() + 1);

      // Clamp to same day one month later
      this.maxDateTo = max.toISOString().split('T')[0];

      // If existing dateTo exceeds the new max, reset it
      if (this.filters.dateTo && new Date(this.filters.dateTo) > max) {
        this.filters.dateTo = '';
        this.dateRangeError = false;
      }
    } else {
      this.maxDateTo = '';
    }
  }

  onDateToChange(): void {
    if (!this.filters.dateFrom || !this.filters.dateTo) return;

    const from = new Date(this.filters.dateFrom);
    const to = new Date(this.filters.dateTo);
    const max = new Date(from);
    max.setMonth(max.getMonth() + 1);

    this.dateRangeError = to > max;

    if (this.dateRangeError) {
      this.filters.dateTo = '';
    }
  }

}
