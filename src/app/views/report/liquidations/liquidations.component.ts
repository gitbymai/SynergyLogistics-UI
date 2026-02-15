import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report/report.service';

@Component({
  selector: 'app-liquidations',
  imports: [CommonModule, FormsModule],
  templateUrl: './liquidations.component.html',
  styleUrl: './liquidations.component.scss',
})
export class LiquidationsComponent {

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  refunds: any[] = [];
  filteredRefunds: any[] = [];
  filterTransactionTypes: string[] = [];
  filterPaymentTypes: string[] = [];
  showFilters: boolean = false;
  filters = {
    transactionType: '',
    paymentType: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(private router: Router,private reportService: ReportService) {

  }

  ngOnInit(): void {

    this.loadRefundList();
  }

  loadRefundList() {
    this.reportService.getallRefunds().subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.refunds = response.data
            .filter(r => r.isActive)
            .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

          this.filteredRefunds = [...this.refunds];
        }
      },
      error: (error) => {
        console.error('API returned error:', error.message);
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredRefunds = term
      ? this.refunds.filter(refund => {
        const searchableFields = [
          refund.jobCode,
          refund.chargeCode,
          refund.referenceNumber,
          refund.transactionTypeName,
          refund.paymentTypeName,
          refund.description,
          refund.houseBillLading,
          refund.masterBillLading,
          refund.houseAirWaybill,
          refund.masterAirWaybill,
          refund.refundId.toString()
        ];
        return searchableFields.some(field =>
          field?.toLowerCase().includes(term)
        );
      })
      : [...this.refunds];

    this.currentPage = 1;
  }

  get paginatedRefunds() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRefunds.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredRefunds.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.filteredRefunds = this.refunds.filter(refund => {
      // Transaction Type filter
      if (this.filters.transactionType && refund.transactionTypeName !== this.filters.transactionType) {
        return false;
      }

      // Payment Type filter
      if (this.filters.paymentType && refund.paymentTypeName !== this.filters.paymentType) {
        return false;
      }

      // Date range filter
      if (this.filters.dateFrom) {
        const refundDate = new Date(refund.createdDate);
        const fromDate = new Date(this.filters.dateFrom);
        if (refundDate < fromDate) {
          return false;
        }
      }

      if (this.filters.dateTo) {
        const refundDate = new Date(refund.createdDate);
        const toDate = new Date(this.filters.dateTo);
        if (refundDate > toDate) {
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
      paymentType: '',
      dateFrom: '',
      dateTo: ''
    };
    this.filteredRefunds = [...this.refunds];
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters.transactionType !== '' ||
      this.filters.paymentType !== '' ||
      this.filters.dateFrom !== '' ||
      this.filters.dateTo !== '';
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.transactionType) count++;
    if (this.filters.paymentType) count++;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    return count;
  }

  calculateTotalRefundAmount(): number {
    return this.filteredRefunds.reduce((total, refund) => total + (refund.refundAmount || 0), 0);
  }


}
