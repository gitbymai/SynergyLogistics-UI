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
        console.log('Job details loaded successfully:', job);
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

    const formatDate = (dateString: string | null | undefined): string => {
      if (!dateString) return '—';
      return new Date(dateString).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    };


    // Freight reference rows — hbl/mbl takes priority, fallback to hawb/mawb
    let freightRefRows = '';
    if (job.hbl && job.mbl) {
      freightRefRows = `
      <tr>
        <td class="label-cell">HBL Reference</td>
        <td class="value-cell mono">${job.hbl}</td>
        <td class="label-cell">MBL Reference</td>
        <td class="value-cell mono">${job.mbl}</td>
      </tr>`;
    } else if (job.hawb || job.mawb) {
      freightRefRows = `
      <tr>
        <td class="label-cell">HAWB Reference</td>
        <td class="value-cell mono">${job.hawb || '—'}</td>
        <td class="label-cell">MAWB Reference</td>
        <td class="value-cell mono">${job.mawb || '—'}</td>
      </tr>`;
    }

    let freightRows = '';
    if (this.isSeaFreight()) {
      freightRows = `
      ${freightRefRows}
      <tr>
        <td class="label-cell">Vessel</td>
        <td class="value-cell">${job.vessel || '—'}</td>
        <td class="label-cell">Container Type</td>
        <td class="value-cell">${job.containerType || '—'}</td>
      </tr>
      <tr>
        <td class="label-cell">Shipper</td>
        <td class="value-cell">${job.shipper || '—'}</td>
        <td class="label-cell">Consignee</td>
        <td class="value-cell">${job.consignee || '—'}</td>
      </tr>`;
    } else if (this.isAirFreight()) {
      freightRows = `
      ${freightRefRows}
      <tr>
        <td class="label-cell">Flight No.</td>
        <td class="value-cell">${job.flightNo || '—'}</td>
        <td class="label-cell">Chargeable Weight</td>
        <td class="value-cell">${job.chargeableWeight ? job.chargeableWeight + ' kg' : '—'}</td>
      </tr>
      <tr>
        <td class="label-cell">Shipper</td>
        <td class="value-cell">${job.shipper || '—'}</td>
        <td class="label-cell">Consignee</td>
        <td class="value-cell">${job.consignee || '—'}</td>
      </tr>`;
    } else {
      freightRows = `
      <tr>
        <td colspan="4" style="text-align:center; color:#94a3b8; font-size:11px; padding:12px;">
          N/A — No freight type detected
        </td>
      </tr>`;
    }

    const freightBadge = this.isSeaFreight()
      ? `<span class="freight-badge sea">🚢 Sea Freight</span>`
      : this.isAirFreight()
        ? `<span class="freight-badge air">✈️ Air Freight</span>`
        : `<span class="freight-badge">—</span>`;

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Job Details — ${job.jobCode || '—'}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 10px;
      color: #1e293b;
      background: #fff;
    }

    .container { width: 100%; max-width: 186mm; margin: 0 auto; }

    /* ── Header ── */
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #1a3a6b;
      margin-bottom: 14px;
    }
    .print-header .brand { font-size: 18px; font-weight: 700; color: #1a3a6b; letter-spacing: -0.5px; }
    .print-header .doc-title { font-size: 11px; color: #64748b; margin-top: 2px; }
    .print-header .job-code-label { font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; }
    .print-header .job-code-value {
      font-size: 16px; font-weight: 700; color: #1a3a6b;
      font-family: 'Courier New', monospace;
    }

    /* ── Section Header ── */
    .section-header {
      background: #1a3a6b;
      color: #fff;
      padding: 5px 10px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 12px;
      border-radius: 4px 4px 0 0;
    }

    /* ── Table ── */
    .detail-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 4px 4px;
      overflow: hidden;
    }
    .detail-table tr:nth-child(even) { background: #f8fafc; }
    .detail-table tr:nth-child(odd)  { background: #fff; }

    .label-cell {
      width: 18%;
      padding: 6px 10px;
      font-weight: 600;
      color: #64748b;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-right: 1px solid #e2e8f0;
      white-space: nowrap;
      vertical-align: middle;
    }
    .value-cell {
      width: 32%;
      padding: 6px 10px;
      color: #1e293b;
      font-size: 10px;
      border-right: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    .value-cell.mono {
      font-family: 'Courier New', monospace;
      color: #1a3a6b;
      font-weight: 600;
    }

    /* ── Freight badge ── */
    .freight-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 700;
    }
    .freight-badge.sea { background: #dbeafe; color: #1d4ed8; }
    .freight-badge.air { background: #fee2e2; color: #b91c1c; }

    /* ── Remarks ── */
    .remarks-cell {
      padding: 8px 10px;
      font-size: 10px;
      color: #475569;
      line-height: 1.5;
      background: #fffbeb;
      border-left: 3px solid #fbbf24;
    }

    /* ── Footer ── */
    .print-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #94a3b8;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="container">

  <!-- ── Header ── -->
  <div class="print-header">
    <div>
      <div class="brand">JOB DETAILS</div>
      <div class="doc-title">Job Summary Report</div>
    </div>
    <div>
      <div class="job-code-label">Job Code</div>
      <div class="job-code-value">${job.jobCode || '—'}</div>
    </div>
  </div>

  <!-- ── Job Information ── -->
  <div class="section-header">📋 Job Information</div>
  <table class="detail-table">
    <tr>
      <td class="label-cell">Client</td>
      <td class="value-cell" colspan="3">${job.customerName || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">Created Date</td>
      <td class="value-cell">${formatDate(job.createdDate)}</td>
      <td class="label-cell">Transaction Type</td>
      <td class="value-cell">${job.transactionTypeName || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">Incoterms</td>
      <td class="value-cell">${job.incotermsName || '—'}</td>
      <td class="label-cell">Payment Type</td>
      <td class="value-cell">${job.paymentTypeName || '—'}</td>
    </tr>
  </table>

  <!-- ── Cargo & Routing ── -->
  <div class="section-header">📦 Cargo &amp; Routing Details</div>
  <table class="detail-table">
    <tr>
      <td class="label-cell">Commodity</td>
      <td class="value-cell">${job.commodity || '—'}</td>
      <td class="label-cell">Carrier</td>
      <td class="value-cell">${job.carrier || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">Origin</td>
      <td class="value-cell">${job.origin || '—'}</td>
      <td class="label-cell">Destination</td>
      <td class="value-cell">${job.destination || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">Port / CFS</td>
      <td class="value-cell" colspan="3">${job.portCfs || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">Gross Weight</td>
      <td class="value-cell">${job.grossWeight ? job.grossWeight + ' kg' : '—'}</td>
      <td class="label-cell">Volume (CBM)</td>
      <td class="value-cell">${job.volume ? job.volume + ' m³' : '—'}</td>
    </tr>
    <tr>
      <td class="label-cell">No. of Packages</td>
      <td class="value-cell" colspan="3">${job.numberOfPackages || '—'}</td>
    </tr>
  </table>

  <!-- ── Freight Details ── -->
  <div class="section-header">🚢 Freight Details</div>
  <table class="detail-table">
    <tr>
      <td class="label-cell">Freight Type</td>
      <td class="value-cell" colspan="3">${freightBadge}</td>
    </tr>
    ${freightRows}
  </table>

  <!-- ── Additional Details ── -->
  <div class="section-header">📝 Additional Details</div>
  <table class="detail-table">
    <tr>
      <td class="label-cell">Agent</td>
      <td class="value-cell">${job.agentName || '—'}</td>
      <td class="label-cell">Booking No.</td>
      <td class="value-cell mono">${job.bookingNo || '—'}</td>
    </tr>
    <tr>
      <td class="label-cell" style="vertical-align:top; padding-top:8px;">Remarks</td>
      <td colspan="3" class="remarks-cell">${job.remarks || 'No remarks.'}</td>
    </tr>
  </table>

  <!-- ── Footer ── -->
  <div class="print-footer">
    <span>Job Code: ${job.jobCode || '—'} &nbsp;|&nbsp; Client: ${job.customerName || '—'}</span>
    <span>Printed: ${new Date().toLocaleString('en-PH')}</span>
  </div>

</div>
</body>
</html>`;

    const popupWin = window.open('', '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
    if (!popupWin) { console.error('Could not open print window'); return; }

    popupWin.document.open();
    popupWin.document.write(htmlTemplate);
    popupWin.document.close();

    popupWin.onload = () => { setTimeout(() => { popupWin.print(); }, 250); };
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