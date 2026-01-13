import { Job } from '../../../models/job';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';
import { JobsService } from '../../../services/jobs/jobs.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chargelist',
  standalone: true,
  imports: [JobChargesComponent, CommonModule, RouterModule],
  templateUrl: './chargelist.component.html',
  styleUrl: './chargelist.component.scss'
})
export class ChargelistComponent {
  job: Job | null = null;
  charges: ChargeTransaction[] = [];
  jobGuid: string = "";
  userRole: string = "";
  isLoading = true;
  errorMessage = '';
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const jobGuid = this.route.snapshot.paramMap.get('jobGuid');

    if (!jobGuid) {
      console.error('Job GUID not provided in route');
      this.errorMessage = 'Job identifier not found';
      this.isLoading = false;
      this.router.navigate(['/jobs/list']);
      return;
    }

    this.userRole = this.authService.getCurrentUserRole() || ''
    this.loadJobDetails(jobGuid);
  }

  loadJobDetails(jobGuid: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.jobService.getByGuid(jobGuid).subscribe({
      next: (job) => {
        this.job = job;
        this.isLoading = false;
        this.loadJobRelatedTransaction(jobGuid);
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.errorMessage = error.message || 'Failed to load job details. Please try again.';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/jobs/list']);
        }, 3000);
      }
    });
  }

  loadJobRelatedTransaction(jobGuid: string): void {

    this.jobGuid = jobGuid;
    this.jobService.getAllChargeTransactionByGuid(jobGuid).subscribe({
      next: (success) => {

        this.jobGuid = jobGuid;
        this.charges = success.data;
      },
      error: (error) => {

        console.error('Error loading job details:', error);
      }
    })
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
}
