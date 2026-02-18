import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { ReportService } from '../../../services/report/report.service';

@Component({
  selector: 'app-pettycash-released',
  imports: [CommonModule, FormsModule],
  templateUrl: './pettycash-released.component.html',
  styleUrl: './pettycash-released.component.scss',
})
export class PettycashReleasedComponent implements OnInit {

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;

  /** Used in the report header: {{ today | date:'MMMM d, yyyy' }} */
  today: Date = new Date();

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

  isLoading = false;
  maxDateTo: string = '';
  dateRangeError: boolean = false;

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
            .filter((c: ChargeTransaction) => c.isActive)
            .sort((a: ChargeTransaction, b: ChargeTransaction) =>
              new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );

          this.filteredCharges = [...this.charges];
        }
      },
      error: (error: any) => {
        console.error('API returned error:', error.message);
      }
    });
  }

  // ── Event Handlers ──────────────────────────────────────────────────────────

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.onSearchChange();
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

  // ── Filters ─────────────────────────────────────────────────────────────────

  clearFilters(): void {
    this.filters = { transactionType: '', status: '', dateFrom: '', dateTo: '' };
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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // ── Pagination ───────────────────────────────────────────────────────────────

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

  // ── Calculations ─────────────────────────────────────────────────────────────

  calculateTotalAmount(): number {
    return this.filteredCharges.reduce((total, charge) => total + (charge.calculatedAmount || 0), 0);
  }

  calculateTotalSellingAmount(): number {
    return this.filteredCharges.reduce((total, charge) => total + (charge.calculatedSellingAmount || 0), 0);
  }

  /** KPI: average charge amount across filtered records */
  calculateAverageAmount(): number {
    if (!this.filteredCharges.length) return 0;
    return this.calculateTotalAmount() / this.filteredCharges.length;
  }

  /** KPI: count of charges that have a processorOwnerName assigned */
  countWithProcessor(): number {
    return this.filteredCharges.filter(c => c.processorOwnerName?.trim()).length;
  }

  // ── Export ───────────────────────────────────────────────────────────────────

  /** Exports the current filtered data as a CSV download */
  exportReport(): void {
    if (!this.filteredCharges.length) return;

    const headers = [
      'Job Code',
      'House AWB/BL',
      'Master AWB/BL',
      'Charge Code',
      'Sub Category',
      'Currency',
      'Amount',
      'Conversion Rate',
      'Processor',
      'Created Date'
    ];

    const rows = this.filteredCharges.map(c => [
      c.jobCode ?? '',
      c.houseBillLading || c.houseAirwayBill || '',
      c.masterBillLading || c.masterAirwayBill || '',
      c.chargeCode ?? '',
      c.chargeSubCategoryName ?? '',
      c.currencyCode ?? '',
      c.amount ?? 0,
      c.conversionRate ?? 1,
      c.processorOwnerName ?? '',
      c.createdDate ? new Date(c.createdDate).toLocaleString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pettycash-released-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

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

  generateReport(): void {
    if (!this.filters.dateFrom || !this.filters.dateTo) {
      alert('Please select both a Date From and Date To before generating.');
      return;
    }

    this.isLoading = true;
    this.charges = [];
    this.filteredCharges = [];

    this.reportService.getallActualReleasedPettyCash(this.filters.dateFrom, this.filters.dateTo).subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.charges = response.data
            .filter((c: ChargeTransaction) => c.isActive)
            .sort((a: ChargeTransaction, b: ChargeTransaction) =>
              new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
        }
        this.filteredCharges = [...this.charges];
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