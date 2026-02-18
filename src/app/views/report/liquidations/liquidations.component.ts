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

  // Used in the report header: {{ today | date:'MMMM d, yyyy' }}
  today: Date = new Date();

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

  isLoading = false;
  maxDateTo: string = '';
  dateRangeError: boolean = false;

  constructor(private router: Router, private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadRefundList();
  }

  loadRefundList() {
    this.reportService.getallRefunds().subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.refunds = response.data
            .filter((r: any) => r.isActive)
            .sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

          this.filteredRefunds = [...this.refunds];
        }
      },
      error: (error: any) => {
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

  /** KPI: average refund amount across filtered records */
  calculateAverageRefundAmount(): number {
    if (!this.filteredRefunds.length) return 0;
    return this.calculateTotalRefundAmount() / this.filteredRefunds.length;
  }

  /** KPI: count of refunds that have a non-empty referenceNumber */
  countWithReference(): number {
    return this.filteredRefunds.filter(r => r.referenceNumber?.trim()).length;
  }

  /** Export the current filtered data as a CSV download */
  exportReport(): void {
    if (!this.filteredRefunds.length) return;

    const headers = [
      'Job Code',
      'House AWB/BL',
      'Master AWB/BL',
      'Charge Code',
      'Description',
      'Currency',
      'Requested Amount',
      'Refund Amount',
      'Reference #',
      'Refund Date'
    ];

    const rows = this.filteredRefunds.map(r => [
      r.jobCode ?? '',
      r.houseBillLading || r.houseAirWaybill || '',
      r.masterBillLading || r.masterAirWaybill || '',
      r.chargeCode ?? '',
      r.description ?? '',
      r.currencyCode ?? '',
      r.amount ?? 0,
      r.refundAmount ?? 0,
      r.referenceNumber ?? '',
      r.createdDate ? new Date(r.createdDate).toLocaleString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `refunds-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  generateReport(): void {
    if (!this.filters.dateFrom || !this.filters.dateTo) {
      // both dates required — you can swap this for a toast/alert
      alert('Please select both a Date From and Date To before generating.');
      return;
    }

    this.isLoading = true;
    this.refunds = [];
    this.filteredRefunds = [];

    this.reportService.getallRefunds(this.filters.dateFrom, this.filters.dateTo).subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.refunds = response.data
            .filter((r: any) => r.isActive)
            .sort((a: any, b: any) =>
              new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
        }
        this.filteredRefunds = [...this.refunds];
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('API returned error:', error.message);
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