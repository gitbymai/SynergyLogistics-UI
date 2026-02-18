import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { ReportService } from '../../../services/report/report.service';

@Component({
  selector: 'app-pettycash-released',
  imports: [CommonModule],
  templateUrl: './pettycash-released.component.html',
  styleUrl: './pettycash-released.component.scss',
})
export class PettycashReleasedComponent implements OnInit {
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  charges: ChargeTransaction[] = [];
  filteredCharges: ChargeTransaction[] = [];
  filterTransactionTypes: string[] = [];
  showFilters: boolean = false;

  filters = {
    transactionType: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(
    private router: Router,
    private reportService: ReportService
  ) { }


  ngOnInit(): void {
    this.loadChargeList();
  }

  loadChargeList() {
    this.reportService.getallActualReleasedPettyCash().subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.charges = response.data
            .filter(c => c.isActive)
            .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

          this.filteredCharges = [...this.charges];

        }
      },
      error: (error) => {
        console.error('API returned error:', error.message);
      }
    });
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.onSearchChange();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filters.status = select.value;
    this.applyFilters();
  }

  onDateFromChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filters.dateFrom = input.value;
    this.applyFilters();
  }

  onDateToChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filters.dateTo = input.value;
    this.applyFilters();
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredCharges = term
      ? this.charges.filter(charge => {
        const searchableFields = [
          charge.jobCode,
          charge.chargeCode,
          charge.jobClientName,
          charge.chargeSubCategoryName,
          charge.chargeCategoryName,
          charge.description,
          charge.jobTransactionType,
          charge.chargeTransactionStatus,
          charge.chargeId.toString()
        ];
        return searchableFields.some(field =>
          field?.toLowerCase().includes(term)
        );
      })
      : [...this.charges];

    this.currentPage = 1;
  }

  applyFilters(): void {
    this.filteredCharges = this.charges.filter(charge => {
      // Transaction Type filter
      if (this.filters.transactionType && charge.jobTransactionType !== this.filters.transactionType) {
        return false;
      }

      // Status filter
      if (this.filters.status && charge.chargeTransactionStatus !== this.filters.status) {
        return false;
      }

      // Date range filter
      if (this.filters.dateFrom) {
        const chargeDate = new Date(charge.createdDate);
        const fromDate = new Date(this.filters.dateFrom);
        if (chargeDate < fromDate) {
          return false;
        }
      }

      if (this.filters.dateTo) {
        const chargeDate = new Date(charge.createdDate);
        const toDate = new Date(this.filters.dateTo);
        if (chargeDate > toDate) {
          return false;
        }
      }

      return true;
    });

    // Apply search term if exists
    if (this.searchTerm) {
      this.onSearchChange();
    }

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.filters = {
      transactionType: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    };
    this.filteredCharges = [...this.charges];
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters.transactionType !== '' ||
      this.filters.status !== '' ||
      this.filters.dateFrom !== '' ||
      this.filters.dateTo !== '';
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.transactionType) count++;
    if (this.filters.status) count++;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    return count;
  }

  get paginatedCharges() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCharges.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredCharges.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  calculateTotalAmount(): number {
    return this.filteredCharges.reduce((total, charge) => total + (charge.calculatedAmount || 0), 0);
  }

  calculateTotalSellingAmount(): number {
    return this.filteredCharges.reduce((total, charge) => total + (charge.calculatedSellingAmount || 0), 0);
  }

  getStatusBadgeClass(status: string | null | undefined): string {
    if (!status) return 'bg-secondary';

    switch (status.toUpperCase()) {
      case 'FOR APPROVAL': return 'bg-warning';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'COMPLETED': return 'bg-primary';
      case 'PENDING': return 'bg-info';
      case 'CANCELLED': return 'bg-dark';
      case 'ONGOING': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

}
