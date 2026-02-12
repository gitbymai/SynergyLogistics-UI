import { Component, OnInit } from '@angular/core';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { ActivatedRoute, Router } from '@angular/router';
import { JobsService } from '../../../services/jobs/jobs.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-pettycash-approval',
  imports: [JobChargesComponent],
  templateUrl: './pettycash-approval.component.html',
  styleUrl: './pettycash-approval.component.scss',
})
export class PettycashApprovalComponent implements OnInit {

  charges: ChargeTransaction[] = [];
  isLoading = true;
  errorMessage = '';
  jobGuid: string = "";
  userRole: string = "";

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
    this.loadJobRelatedTransaction(jobGuid);
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
    else if(this.userRole === 'SALES') {
      this.jobService.getAllChargeTransactionByGuidBySales(jobGuid).subscribe({
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
