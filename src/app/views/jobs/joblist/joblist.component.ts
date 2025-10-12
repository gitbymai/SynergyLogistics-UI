import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-joblist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './joblist.component.html',
  styleUrls: ['./joblist.component.scss']
})
export class JoblistComponent implements OnInit {

  jobs: any[] = [];
  filteredJobs: any[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  constructor(private router: Router) { }

  ngOnInit(): void {
    // 🔹 Mock Job Data — replace with API data later
    this.jobs = [
      { id: 'JOB-1001', client: 'ABC Logistics', transactionType: 'Sea Export', origin: 'Manila', destination: 'Singapore', amount: 12500, createdDate: '2025-10-10' },
      { id: 'JOB-1002', client: 'Blue Ocean Freight', transactionType: 'Air Import', origin: 'Tokyo', destination: 'Cebu', amount: 8700, createdDate: '2025-10-08' },
      { id: 'JOB-1003', client: 'SkyPort Handling', transactionType: 'Sea Import', origin: 'Singapore', destination: 'Batangas', amount: 5600, createdDate: '2025-10-05' },
      { id: 'JOB-1004', client: 'Portlink Transport', transactionType: 'Air Export', origin: 'Manila', destination: 'Hong Kong', amount: 9100, createdDate: '2025-10-03' },
      { id: 'JOB-1005', client: 'FreightWorks', transactionType: 'Sea Export', origin: 'Cebu', destination: 'Jakarta', amount: 13400, createdDate: '2025-09-29' },
      { id: 'JOB-1006', client: 'FastMove Cargo', transactionType: 'Air Import', origin: 'Dubai', destination: 'Manila', amount: 11200, createdDate: '2025-09-26' }
    ];
    this.filteredJobs = [...this.jobs];
  }

  /** 🔍 Filter jobs by search term */
  onSearchChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredJobs = this.jobs.filter(job =>
      job.client.toLowerCase().includes(term) ||
      job.transactionType.toLowerCase().includes(term) ||
      job.origin.toLowerCase().includes(term) ||
      job.destination.toLowerCase().includes(term) ||
      job.id.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  /** ↕️ Sort by column */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredJobs.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (typeof valA === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return this.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }

  /** 📄 Paginate jobs */
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

  /** 🚀 Actions */
  viewJob(job: any) {
    this.router.navigate(['/jobs/jobmanagement', job.id]);
  }

  editJob(job: any) {
    alert(`Editing job ${job.id}`);
  }

  deleteJob(job: any) {
    if (confirm(`Are you sure you want to delete ${job.id}?`)) {
      this.jobs = this.jobs.filter(j => j.id !== job.id);
      this.filteredJobs = [...this.jobs];
    }
  }
}
