import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobsService } from '../../../services/jobs/jobs.service';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-transactionlist',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactionlist.component.html',
  styleUrl: './transactionlist.component.scss'
})
export class TransactionlistComponent implements OnInit {

  financials: ChargeTransaction[] = [];
  filteredFinancials: ChargeTransaction[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showFilters = false;

  filters = {
    status: '',
    chargesubcategory: '',
    jobcode: '',
    chargecode: ''
  };

  constructor(private router: Router, private jobService: JobsService, private authService: AuthService) {

  }

  ngOnInit(): void {

    this.loadChargeList();

  }

  loadChargeList() {

    var currentRole = this.authService.getCurrentUserRole()?.toString() ?? '';

      this.jobService.getChargeTransactionByRole(currentRole).subscribe({

        next: (res) => {

          if (res.success && res.data?.length) {

            this.financials = res.data
              .filter(a => a.isActive && a.amount > 0)
              .sort((a, b) => b.chargeId = a.chargeId)

            this.filteredFinancials = [...this.financials];
          }

        },
        error: (e) => {
          console.error('API returned error:', e.message);
        }
      });

  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredFinancials = term
      ? this.financials.filter(a => {
        const searchableFields = [
          a.chargeTransactionStatus,
          a.chargeSubCategoryName,
          a.jobCode,
          a.chargeCode
        ];
        return searchableFields.some(field =>
          field?.toLowerCase().includes(term)
        );
      })
      : [...this.filteredFinancials];

    this.currentPage = 1;
  }

  sortBy(column: keyof ChargeTransaction): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredFinancials.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];

      // Handle null/undefined values (push to end)
      if (valA == null && valB == null) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      // String comparison
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Number comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Fallback for other types
      return 0;
    });
  }


  get paginatedJobs() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFinancials.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredFinancials.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  viewJobFinancial(transaction: any) {
    this.router.navigate(['/jobs/jobmanagement', transaction.chargeGuid]);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'FOR APPROVAL': return 'bg-warning text-dark';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'COMPLETED': return 'bg-info';
      default: return 'bg-secondary';
    }
  }


  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }


  applyFilters(): void {
    this.filteredFinancials = this.financials.filter(tran => {

      if (this.filters.status && tran.chargeTransactionStatus !== this.filters.status) {
        return false;
      }

      if (this.filters.chargecode && tran.chargeCode !== this.filters.chargecode) {
        return false;
      }

      if (this.filters.chargesubcategory && tran.chargeCategoryName !== this.filters.chargesubcategory) {
        return false;
      }

      if (this.filters.jobcode && tran.jobCode !== this.filters.jobcode) {
        return false;
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
      status: '',
      chargecode: '',
      chargesubcategory: '',
      jobcode: ''

    };
    this.filteredFinancials = [...this.financials];
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters.status !== '' ||
      this.filters.chargecode !== '' ||
      this.filters.chargesubcategory !== '' ||
      this.filters.jobcode !== '';
  }
  activeFilterCount(): number {
    let count = 0;
    if (this.filters.status) count++;
    if (this.filters.chargecode) count++;
    if (this.filters.chargesubcategory) count++;
    if (this.filters.jobcode) count++;
    return count;
  }

}
