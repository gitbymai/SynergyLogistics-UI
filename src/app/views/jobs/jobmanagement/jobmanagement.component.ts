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
import { HttpClient } from '@angular/common/http';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';
import { JobsService } from '../../../services/jobs/jobs.service';
import { Job } from '../../../models/job';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { AuthService } from '../../../services/auth.service';

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
  userRole: string = "";
  showApproveConfirmModal = false;
  showCloseConfirmModal = false;
  showReplicateConfirmModal = false;
  showActiveTransactionsModal = false;
  isSubmitting = false;
  selectedJob: Job | null = null;
  openSection: string = 'jobInfo';

  showDisapproveConfirmModal = false;

  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';

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

    this.userRole = this.authService.getCurrentUserRole() || '';
    this.loadJobDetails(jobGuid);
  }

  toggleSection(section: string): void {
    this.openSection = this.openSection === section ? '' : section;
  }

  isSectionOpen(section: string): boolean {
    return this.openSection === section;
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

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bi-check-circle';
      case 'pending':
        return 'bi-clock';
      case 'cancelled':
      case 'inactive':
        return 'bi-x-circle';
      case 'in progress':
      case 'in-progress':
        return 'bi-hourglass-split';
      default:
        return 'bi-question-circle';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'CLOSED':
        return 'bg-success';
      case 'FOR APPROVAL':
        return 'bg-warning';
      case 'ONGOING':
        return 'bg-primary';
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

    const job = this.job!;

    // Generate dynamic freight HTML based on transaction type
    let freightHtml = '';
    let freightClass = '';

    if (this.isSeaFreight()) {
      freightClass = 'sea';
      freightHtml = `
      <div class="col-4">
        <div class="field-row"><label>MBL Reference</label><div class="value">${job.mbl || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>HBL Reference</label><div class="value">${job.hbl || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Vessel</label><div class="value">${job.vessel || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Container Type</label><div class="value">${job.containerType || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Shipper</label><div class="value">${job.shipper || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Consignee</label><div class="value">${job.consignee || '-'}</div></div>
      </div>
    `;
    } else if (this.isAirFreight()) {
      freightClass = 'air';
      freightHtml = `
      <div class="col-4">
        <div class="field-row"><label>MAWB Reference</label><div class="value">${job.mawb || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>HAWB Reference</label><div class="value">${job.hawb || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Flight No.</label><div class="value">${job.flightNo || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Chargeable Weight</label><div class="value">${job.chargeableWeight ? job.chargeableWeight + ' kg' : '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Shipper</label><div class="value">${job.shipper || '-'}</div></div>
      </div>
      <div class="col-4">
        <div class="field-row"><label>Consignee</label><div class="value">${job.consignee || '-'}</div></div>
      </div>
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

    // Build the complete HTML template with data
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Job Details - ${job.jobCode || '-'}</title>
      <style>
        @page {
          size: A4;
          margin: 10mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 9px;
          line-height: 1.3;
          color: #000;
        }

        .print-container {
          width: 100%;
          max-width: 190mm;
          margin: 0 auto;
        }

        /* Header */
        .print-header {
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 2px solid #333;
        }

        .print-header h1 {
          font-size: 16px;
          margin-bottom: 3px;
          color: #2c3e50;
        }

        .print-header .job-code {
          font-size: 11px;
          color: #666;
          font-weight: bold;
        }

        /* Section Headers */
        .section-header {
          background: #34495e;
          color: white;
          padding: 3px 6px;
          font-size: 10px;
          font-weight: bold;
          margin-top: 6px;
          margin-bottom: 4px;
        }

        /* Grid Layout */
        .print-row {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 2px;
        }

        .col-3 {
          width: 25%;
          padding: 2px 4px;
        }

        .col-4 {
          width: 33.33%;
          padding: 2px 4px;
        }

        .col-6 {
          width: 50%;
          padding: 2px 4px;
        }

        .col-12 {
          width: 100%;
          padding: 2px 4px;
        }

        /* Field Styling */
        .field-row {
          margin-bottom: 3px;
        }

        .field-row label {
          font-weight: 600;
          display: block;
          margin-bottom: 1px;
          color: #555;
          font-size: 8px;
        }

        .field-row .value {
          color: #000;
          font-size: 9px;
          padding: 2px;
          background: #f8f9fa;
          border-left: 2px solid #3498db;
          padding-left: 4px;
        }

        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8px;
          font-weight: bold;
          background: #ffc107;
          color: #000;
        }

        /* Highlight Box */
        .highlight-box {
          background: #e8f4f8;
          border: 1px solid #3498db;
          padding: 4px;
          text-align: center;
        }

        .highlight-box .value {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
          background: transparent;
          border: none;
        }

        /* Freight Badge */
        .freight-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .freight-sea {
          background: #3498db;
          color: white;
        }

        .freight-air {
          background: #e74c3c;
          color: white;
        }

        /* Remarks */
        .remarks-box {
          background: #fff9e6;
          border: 1px solid #ffc107;
          padding: 4px;
          font-size: 8px;
          min-height: 30px;
          max-height: 40px;
          overflow: hidden;
        }

        /* Footer */
        .print-footer {
          text-align: center;
          margin-top: 8px;
          padding-top: 4px;
          border-top: 1px solid #ddd;
          font-size: 7px;
          color: #999;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print-container {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        
        <!-- HEADER -->
        <div class="print-header">
          <h1>JOB DETAILS</h1>
          <div class="job-code">Job Code: ${job.jobCode || '-'}</div>
        </div>

        <!-- JOB INFORMATION -->
        <div class="section-header">📋 JOB INFORMATION</div>
        <div class="print-row">
          <div class="col-6">
            <div class="field-row">
              <label>Client</label>
              <div class="value">${job.customerName || '-'}</div>
            </div>
          </div>
          <div class="col-3">
            <div class="field-row">
              <label>Status</label>
              <div class="value"><span class="status-badge">${job.jobStatusName || 'Pending'}</span></div>
            </div>
          </div>
          <div class="col-3">
            <div class="field-row">
              <label>Created Date</label>
              <div class="value">${formatDate(job.createdDate)}</div>
            </div>
          </div>
        </div>

        <div class="print-row">
          <div class="col-4">
            <div class="field-row">
              <label>Transaction Type</label>
              <div class="value">${job.transactionTypeName || '-'}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="field-row">
              <label>Incoterms</label>
              <div class="value">${job.incotermsName || '-'}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="field-row">
              <label>Payment Type</label>
              <div class="value">${job.paymentTypeName || '-'}</div>
            </div>
          </div>
        </div>

        <div class="print-row">
          <div class="col-12">
            <div class="field-row highlight-box">
              <label>Amount</label>
              <div class="value">${formatCurrency(job.amount)}</div>
            </div>
          </div>
        </div>

        <!-- CARGO & ROUTING -->
        <div class="section-header">📦 CARGO & ROUTING DETAILS</div>
        <div class="print-row">
          <div class="col-4">
            <div class="field-row">
              <label>Commodity</label>
              <div class="value">${job.commodity || '-'}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="field-row">
              <label>Carrier</label>
              <div class="value">${job.carrier || '-'}</div>
            </div>
          </div>
        </div>

        <div class="print-row">
          <div class="col-3">
            <div class="field-row">
              <label>Origin</label>
              <div class="value">${job.origin || '-'}</div>
            </div>
          </div>
          <div class="col-3">
            <div class="field-row">
              <label>Destination</label>
              <div class="value">${job.destination || '-'}</div>
            </div>
          </div>
          <div class="col-3">
            <div class="field-row">
              <label>Port / CFS</label>
              <div class="value">${job.portCfs || '-'}</div>
            </div>
          </div>

        </div>

        <div class="print-row">
          <div class="col-4">
            <div class="field-row">
              <label>Gross Weight</label>
              <div class="value">${job.grossWeight ? job.grossWeight + ' kg' : '-'}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="field-row">
              <label>Volume (CBM)</label>
              <div class="value">${job.volume ? job.volume + ' m³' : '-'}</div>
            </div>
          </div>
          <div class="col-4">
            <div class="field-row">
              <label>Number of Packages</label>
              <div class="value">${job.numberOfPackages || '-'}</div>
            </div>
          </div>
        </div>

        <!-- FREIGHT DETAILS -->
        <div class="section-header">🚢 FREIGHT DETAILS</div>
        <div class="print-row">
          <div class="col-12">
            <span class="freight-badge freight-${freightClass}">${this.isSeaFreight() ? 'Sea Freight' : this.isAirFreight() ? 'Air Freight' : 'N/A'}</span>
          </div>
        </div>
        <div class="print-row">
          ${freightHtml}
        </div>

        <!-- ADDITIONAL DETAILS -->
        <div class="section-header">📝 ADDITIONAL DETAILS</div>
        <div class="print-row">
          <div class="col-6">
            <div class="field-row">
              <label>Agent</label>
              <div class="value">${job.agent || '-'}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="field-row">
              <label>Booking No.</label>
              <div class="value">${job.bookingNo || '-'}</div>
            </div>
          </div>
        </div>

        <div class="print-row">
          <div class="col-12">
            <div class="field-row">
              <label>Remarks</label>
              <div class="remarks-box">${job.remarks || 'No remarks'}</div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="print-footer">
          Printed on ${new Date().toLocaleString('en-PH')}
        </div>

      </div>
    </body>
    </html>
  `;

    // Open print window with proper dimensions
    const popupWin = window.open('', '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
    if (!popupWin) {
      console.error('Could not open print window');
      return;
    }

    popupWin.document.open();
    popupWin.document.write(htmlTemplate);
    popupWin.document.close();

    // Trigger print after content loads
    popupWin.onload = () => {
      setTimeout(() => {
        popupWin.print();
      }, 250);
    };
  }

  openCloseConfirm(job: any) {

    this.selectedJob = job;

    if (this.hasOngoingChargeTransaction()) {
      this.showActiveTransactionsModal = true;
    } else {

      this.showCloseConfirmModal = true;
    }

  }

  closeClosingConfirmation() {
    this.showCloseConfirmModal = false;
  }
  closeActiveTransactionsModal() {

    this.showActiveTransactionsModal = false;
  }
  confirmCloseJob() {

    this.isSubmitting = true;

    this.jobService.closeJob(this.selectedJob!.jobGuid).subscribe({
      next: (response) => {
        this.loadJobDetails(this.selectedJob!.jobGuid);

        this.showSuccess(`Job ${this.job!.jobCode} closed successfully`);
        this.isSubmitting = false;
        this.closeClosingConfirmation();
      },
      error: (error) => {
        console.error('Error closing job:', error);
        this.showError(error.message || 'Failed to close job. Please try again.');
        this.isSubmitting = false;
      }
    });

    this.closeApproveConfirm();

  }

  openReplicateConfirm(job: any) {

    this.selectedJob = job;
    this.showReplicateConfirmModal = true;
  }

  closeReplicateConfirm() {
    this.showReplicateConfirmModal = false;
  }

  confirmReplicateJob() {
    this.isSubmitting = true;

    this.jobService.replicateJob(this.selectedJob!.jobGuid).subscribe({
      next: (response) => {
        this.loadJobDetails(this.selectedJob!.jobGuid);

        this.showSuccess(`Job ${this.job!.jobCode} replicated successfully`);
        this.isSubmitting = false;
        this.closeReplicateConfirm();
      },
      error: (error) => {
        console.error('Error replicating job:', error);
        this.showError(error.message || 'Failed to replicate job. Please try again.');
        this.isSubmitting = false;
      }
    });

    this.closeReplicateConfirm();

  }

  openApproveConfirm(job: any) {
    this.selectedJob = job;
    this.showApproveConfirmModal = true;
  }

  closeApproveConfirm() {
    this.showApproveConfirmModal = false;
  }

  confirmApprove() {
    this.isSubmitting = true;

    this.jobService.approveJob(this.selectedJob!.jobGuid).subscribe({
      next: (response) => {
        this.loadJobDetails(this.selectedJob!.jobGuid);

        this.showSuccess(`Job ${this.job!.jobCode} approved successfully`);
        this.isSubmitting = false;
        this.closeApproveConfirm();
      },
      error: (error) => {
        console.error('Error approving job:', error);
        this.showError(error.message || 'Failed to approve job. Please try again.');
        this.isSubmitting = false;
      }
    });

    this.closeApproveConfirm();
  }

  openDisapproveConfirm(job: any) {
    this.selectedJob = job;
    this.showDisapproveConfirmModal = true;
  }

  closeDisapproveConfirm() {
    this.showDisapproveConfirmModal = false;
  }

  confirmDisapprove() {
    this.isSubmitting = true;

    this.jobService.disapproveJob(this.selectedJob!.jobGuid).subscribe({
      next: (response) => {
        this.loadJobDetails(this.selectedJob!.jobGuid);

        this.showSuccess(`Job ${this.job!.jobCode} disapproved successfully`);
        this.isSubmitting = false;
        this.closeDisapproveConfirm();
      },
      error: (error) => {
        console.error('Error disapproving job:', error);
        this.showError(error.message || 'Failed to disapprove job. Please try again.');
        this.isSubmitting = false;
      }
    });

    this.closeDisapproveConfirm();
  }

  hasOngoingChargeTransaction(): boolean {
    const activeStatuses = [
      "FOR APPROVAL",
      "APPROVED",
      "FOR RELEASING",
      "CASH RECEIVED - FOR LIQUIDATION",
      "FOR CLEARING",
      "CLEARED"
    ];

    return this.charges.some(charge =>
      charge.chargeTransactionStatus != null &&
      activeStatuses.includes(charge.chargeTransactionStatus)
    );
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 4000);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 4000);
  }
}