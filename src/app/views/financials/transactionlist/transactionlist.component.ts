import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobsService } from '../../../services/jobs/jobs.service';
import { AuthService } from '../../../services/auth.service';
import { JobTransactionType } from '../../../models/jobtransactiontype';
import { Job } from '../../../models/job';
import { Configuration } from '../../../models/configuration';

@Component({
  selector: 'app-transactionlist',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactionlist.component.html',
  styleUrl: './transactionlist.component.scss'
})
export class TransactionlistComponent implements OnInit {

  jobs: Job[] = [];
  filterJobStatus: Configuration[] = [];

  filterIncotermsList: Configuration[] = [];
  filterJobTransactionTypeList: JobTransactionType[] = [];
  filterPaymenTypeList: Configuration[] = [];

  filteredJobs: Job[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showFilters = true;
  filters = {
    status: '',
    transactionType: '',
    customer: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor(private router: Router, private jobService: JobsService, private authService: AuthService) {

  }

  ngOnInit(): void {

    this.loadJobList();
    this.loadFilterOptionFields();
    this.loadJobTransactionTypes();

  }

  loadJobList() {

    this.jobService.getAllJobs().subscribe({

      next: (response) => {

        if (response.success && response.data?.length) {
          this.jobs = response.data
            .filter(c => c.isActive)
            .map(job => ({
              ...job,
              agingDays: this.calculateAgingDays(job.createdDate)
            }))
            .sort((a, b) => b.jobId - a.jobId);

          this.filteredJobs = [...this.jobs];
        }

      },
      error: (error) => {
        console.error('API returned error:', error.message);
      }

    });
  }

  calculateAgingDays(createdDate: string | Date | null | undefined): number {
    if (!createdDate) {
      return 0;
    }

    const created = new Date(createdDate);
    const today = new Date();

    // Reset time to midnight for accurate day calculation
    created.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffTime = today.getTime() - created.getTime();

    // Convert to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 ? diffDays : 0; // Return 0 if future date
  }

  loadFilterOptionFields() {

    this.jobService.getAllConfigurations().subscribe({
      next: (response) => {
        if (response.success) {
          this.setFilterJobStatus(response.data);
        } else {
          console.error('API returned error:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading configurations:', error);
      }
    });

  }
  
  loadJobTransactionTypes(): void {
    this.jobService.getJobTransactionTypes().subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.filterJobTransactionTypeList = response.data
            .filter(type => type.isActive)
            .sort((a, b) => a.jobTransactionType.localeCompare(b.jobTransactionType));
        } else {
          console.error('API returned error: ', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading job transaction types:', error);
      }
    })
  }

  setFilterJobStatus(jobStatus: Configuration[]) {
    if (jobStatus?.length) {
      this.filterJobStatus = jobStatus
        .filter(term => term.category === 'JOBSTATUS' && term.isActive)
        .sort((a, b) => a.value.localeCompare(b.value));
    }
  }

  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredJobs = term
      ? this.jobs.filter(job => {
        const searchableFields = [
          job.jobCode,
          job.customerName,
          job.transactionTypeName,
          job.jobStatusName,
          job.origin,
          job.jobId.toString()
        ];
        return searchableFields.some(field =>
          field?.toLowerCase().includes(term)
        );
      })
      : [...this.jobs];

    this.currentPage = 1;
  }

  sortBy(column: keyof Job): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredJobs.sort((a, b) => {
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
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  viewJob(job: any) {
    this.router.navigate(['/jobs/financials/chargelists/', job.jobGuid]);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'FOR APPROVAL': return 'badge-for-approval';
      case 'ONGOING': return 'badge-ongoing';
      case 'REJECTED': return 'badge-rejected';
      case 'COMPLETED': return 'badge-completed';
      case 'PENDING': return 'badge-pending';
      case 'ACTIVE': return 'badge-active';
      case 'INACTIVE': return 'badge-inactive';
      case 'APPROVED': return 'badge-approved';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'badge-default';
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.filteredJobs = this.jobs.filter(job => {
      // Status filter
      if (this.filters.status && job.jobStatusName !== this.filters.status) {
        return false;
      }

      // Transaction Type filter
      if (this.filters.transactionType && job.transactionTypeName !== this.filters.transactionType) {
        return false;
      }

      // Customer filter
      if (this.filters.customer && !job.customerName?.toLowerCase().includes(this.filters.customer.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (this.filters.dateFrom) {
        const jobDate = new Date(job.createdDate);
        const fromDate = new Date(this.filters.dateFrom);
        if (jobDate < fromDate) {
          return false;
        }
      }

      if (this.filters.dateTo) {
        const jobDate = new Date(job.createdDate);
        const toDate = new Date(this.filters.dateTo);
        if (jobDate > toDate) {
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
      status: '',
      transactionType: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
    };
    this.filteredJobs = [...this.jobs];
    this.currentPage = 1;
  }

  hasActiveFilters(): boolean {
    return this.filters.status !== '' ||
      this.filters.transactionType !== '' ||
      this.filters.customer !== '' ||
      this.filters.dateFrom !== '' ||
      this.filters.dateTo !== '';
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.status) count++;
    if (this.filters.transactionType) count++;
    if (this.filters.customer) count++;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    return count;
  }

}
