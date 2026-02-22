import { Component, OnInit } from '@angular/core';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobsService } from '../../../services/jobs/jobs.service';
import { AuthService } from '../../../services/auth.service';
import { Job } from '../../../models/job';

@Component({
  selector: 'app-pettycash-approval',
  imports: [JobChargesComponent, RouterModule],
  templateUrl: './pettycash-approval.component.html',
  styleUrl: './pettycash-approval.component.scss',
})
export class PettycashApprovalComponent implements OnInit {

  job: Job | null = null;
  charges: ChargeTransaction[] = [];
  jobGuid: string = "";
  userRole: string = "";
  isLoading = true;
  errorMessage = '';

  constructor(
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
      this.router.navigate(['/approvals/pettycash']);
      return;
    }

    this.userRole = this.authService.getCurrentUserRole() || '';
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
    if (this.userRole === 'CASHIER') {


      this.jobService.getAllChargeTransactionByGuidByCashier(jobGuid).subscribe({
        next: (success) => {

          this.jobGuid = jobGuid;
          this.charges = success.data;
        },
        error: (error) => {

          console.error('Error loading job details:', error);
        }
      });


    } else if (this.userRole === 'TREASURER') {
      this.jobService.getAllChargeTransactionByGuidByTreasurer(jobGuid).subscribe({
        next: (success) => {

          this.jobGuid = jobGuid;
          this.charges = success.data;
        },
        error: (error) => {

          console.error('Error loading job details:', error);
        }
      });
    }
    else if (this.userRole === 'OPSMGR' || this.userRole === 'SALES') {
      this.jobService.getAllChargeTransactionByGuidByOpsMgr(jobGuid).subscribe({
        next: (success) => {
          this.jobGuid = jobGuid;
          this.charges = success.data;
        },
        error: (error) => {

          console.error('Error loading job details:', error);
        }
      });
    }
    else {

      this.jobService.getAllChargeTransactionByGuid(jobGuid).subscribe({
        next: (success) => {

          this.jobGuid = jobGuid;
          this.charges = success.data;
        },
        error: (error) => {

          console.error('Error loading job details:', error);
        }
      });
    }
  }

}
