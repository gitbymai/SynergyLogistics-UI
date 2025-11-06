import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardModule,
  AccordionModule,
  ButtonModule,
  BadgeModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';
import { JobsService } from '../../../services/jobs/jobs.service';
import { Job } from '../../../models/job';
import { ChargeTransaction } from '../../../models/chargetransaction';

@Component({
  selector: 'app-jobmanagement',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AccordionModule,
    ButtonModule,
    BadgeModule,
    IconModule,
    RouterModule,
    HttpClientModule,
    JobChargesComponent
  ],
  templateUrl: './jobmanagement.component.html',
  styleUrls: ['./jobmanagement.component.scss'],
})
export class JobmanagementComponent implements OnInit {
  job: Job | null = null;
  charges: ChargeTransaction[] = [];
  jobGuid: string = "";
  isLoading = true;
  errorMessage = '';

  openSection: string = 'jobInfo'; // Default to first section open


  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobsService
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

    this.loadJobDetails(jobGuid);
  }

  toggleSection(section: string): void {
    this.openSection = this.openSection === section ? '' : section;
  }

  isSectionOpen(section: string): boolean {
    return this.openSection === section;
  }

  loadJobRelatedTransaction(jobGuid: string):void{
    this.jobService.getAllChargeTransction(jobGuid).subscribe({
      next: (success) =>{

        this.jobGuid = jobGuid;
        this.charges = success.data;
        console.log(success.data);
      },
      error: (error) => {
        
        console.error('Error loading job details:', error);
      }
    })
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

  isSeaFreight(): boolean {

    const seaTransactionTypes = [
      "CUSTOMS RELEASING (S)",
      "SEA EXPORT",
      "SEA IMPORT",
      "DOMESTIC FORWARDING SEAFREIGHT"
    ];

    var result = this.job?.transactionTypeName
      ? seaTransactionTypes.includes(this.job.transactionTypeName.toUpperCase())
      : false;

    return result;
  }

  isAirFreight(): boolean {
    
      const seaTransactionTypes = [
      "CUSTOMS RELEASING (A)",
      "AIR EXPORT",
      "AIR IMPORT",
      "DOMESTIC FORWARDING AIRFREIGHT"
    ];

    var result = this.job?.transactionTypeName
      ? seaTransactionTypes.includes(this.job.transactionTypeName.toUpperCase())
      : false;

    return result;

  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-success';
      case 'FOR APPROVAL':
      case 'PENDING':
        return 'bg-warning';
      case 'APPROVED':
        return 'bg-info';
      case 'IN PROGRESS':
        return 'bg-primary';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  printJobDetails(): void {
    if (!this.job) {
      console.error('No job data to print');
      return;
    }

    this.http.get('assets/print-templates/job-details.html', { responseType: 'text' })
      .subscribe({
        next: (template) => {
          const job = this.job!;

          // Generate dynamic freight HTML based on transaction type
          let freightHtml = '';
          if (this.isSeaFreight()) {
            freightHtml = `
              <div class="col-print field-row"><label>MBL Reference</label><div>${job.mbl || '-'}</div></div>
              <div class="col-print field-row"><label>HBL Reference</label><div>${job.hbl || '-'}</div></div>
              <div class="col-print field-row"><label>Vessel</label><div>${job.vessel || '-'}</div></div>
              <div class="col-print field-row"><label>Container Type</label><div>${job.containerType || '-'}</div></div>
              <div class="col-print field-row"><label>Container Count</label><div>${job.containerCount || '-'}</div></div>
              <div class="col-print field-row"><label>Gross Weight</label><div>${job.grossWeight ? job.grossWeight + ' kg' : '-'}</div></div>
              <div class="col-print field-row"><label>Volume (CBM)</label><div>${job.volume ? job.volume + ' m³' : '-'}</div></div>
              <div class="col-print field-row"><label>Shipper</label><div>${job.shipper || '-'}</div></div>
              <div class="col-print field-row"><label>Consignee</label><div>${job.consignee || '-'}</div></div>
            `;
          } else if (this.isAirFreight()) {
            freightHtml = `
              <div class="col-print field-row"><label>MAWB Reference</label><div>${job.mawb || '-'}</div></div>
              <div class="col-print field-row"><label>HAWB Reference</label><div>${job.hawb || '-'}</div></div>
              <div class="col-print field-row"><label>Flight No.</label><div>${job.flightNo || '-'}</div></div>
              <div class="col-print field-row"><label>Chargeable Weight</label><div>${job.chargeableWeight ? job.chargeableWeight + ' kg' : '-'}</div></div>
              <div class="col-print field-row"><label>Shipper</label><div>${job.shipper || '-'}</div></div>
              <div class="col-print field-row"><label>Consignee</label><div>${job.consignee || '-'}</div></div>
            `;
          }

          // Format dates
          const formatDate = (dateString: string | null | undefined): string => {
            if (!dateString) return '-';
            return new Date(dateString).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          };

          // Format currency
          const formatCurrency = (amount: number | null | undefined): string => {
            if (!amount) return '₱0.00';
            return `₱${amount.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          };

          // Replace placeholders in template with actual job data
          let filledTemplate = template
            .replace('{{jobCode}}', job.jobCode || '-')
            .replace('{{client}}', job.customerName || '-')
            .replace('{{transactionType}}', job.transactionTypeName || '-')
            .replace('{{incoterms}}', job.incotermsName || '-')
            .replace('{{paymentType}}', job.paymentTypeName || '-')
            .replace('{{amount}}', formatCurrency(job.amount))
            .replace('{{createdDate}}', formatDate(job.createdDate))
            .replace('{{status}}', job.jobStatusName || 'Pending')
            .replace('{{commodity}}', job.commodity || '-')
            .replace('{{cutoff}}', formatDate(job.cutoff))
            .replace('{{etd}}', formatDate(job.etd))
            .replace('{{eta}}', formatDate(job.eta))
            .replace('{{carrier}}', job.carrier || '-')
            .replace('{{origin}}', job.origin || '-')
            .replace('{{destination}}', job.destination || '-')
            .replace('{{portCfs}}', job.portCfs || '-')
            .replace('{{agent}}', job.agent || '-')
            .replace('{{bookingNo}}', job.bookingNo || '-')
            .replace('{{remarks}}', job.remarks || 'No remarks')
            .replace('{{freightTypeLabel}}', this.isSeaFreight() ? 'Sea Freight' : this.isAirFreight() ? 'Air Freight' : 'N/A')
            .replace('{{freightDetails}}', freightHtml)
            .replace('{{printFooter}}', `Printed on ${new Date().toLocaleString('en-PH')}`);

          // Open print window
          const popupWin = window.open('', '_blank', 'width=900,height=600');
          if (!popupWin) {
            console.error('Could not open print window');
            return;
          }

          popupWin.document.open();
          popupWin.document.write(filledTemplate);
          popupWin.document.close();

          // Trigger print after content loads
          popupWin.onload = () => {
            popupWin.print();
          };
        },
        error: (error) => {
          console.error('Error loading print template:', error);
          alert('Failed to load print template. Please try again.');
        }
      });
  }
}