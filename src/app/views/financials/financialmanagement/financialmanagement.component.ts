import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CardModule,
  AccordionModule,
  ButtonModule,
  BadgeModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JobsService } from '../../../services/jobs/jobs.service';
import { Job } from '../../../models/job';
import { ChargeTransaction } from '../../../models/chargetransaction';
import { ChargeTransactionService } from '../../../services/chargetransaction/chargetransaction.service';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdDate: Date;
}

interface AuditTrail {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  description?: string;
}

@Component({
  selector: 'app-financialsmanagement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    AccordionModule,
    ButtonModule,
    BadgeModule,
    IconModule,
    RouterModule,
    HttpClientModule,
  ],
  templateUrl: './financialmanagement.component.html',
  styleUrls: ['./financialmanagement.component.scss'],
})
export class FinancialmanagementComponent implements OnInit {
  job: Job | null = null;
  chargeTransaction: ChargeTransaction | null = null;
  comments: Comment[] = [];
  auditTrail: AuditTrail[] = [];
  
  newComment: string = '';
  chargeGuid: string = '';
  isLoading = true;
  errorMessage = '';

  openSection: string = 'chargeDetails'; // Default to charge details open

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobsService,
    private chargeService: ChargeTransactionService
  ) {}

  ngOnInit(): void {
    const chargeGuid = this.route.snapshot.paramMap.get('chargeGuid');

    if (!chargeGuid) {
      console.error('Charge GUID not provided in route');
      this.errorMessage = 'Charge identifier not found';
      this.isLoading = false;
      this.router.navigate(['/charges/list']);
      return;
    }

    this.chargeGuid = chargeGuid;
    this.loadChargeDetails(chargeGuid);
    this.loadComments(chargeGuid);
    this.loadAuditTrail(chargeGuid);
  }

  // ==================== SECTION MANAGEMENT ====================
  toggleSection(section: string): void {
    this.openSection = this.openSection === section ? '' : section;
  }

  isSectionOpen(section: string): boolean {
    return this.openSection === section;
  }

  // ==================== DATA LOADING ====================
  loadChargeDetails(chargeGuid: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load charge transaction details
    this.chargeService.getChargeByGuid(chargeGuid).subscribe({
      next: (charge) => {
        this.chargeTransaction = charge;
        
        console.log(this.chargeTransaction);

        // Load related job information
        if (charge.jobGuid) {
          this.loadJobDetails(charge.jobGuid);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading charge details:', error);
        this.errorMessage = error.message || 'Failed to load charge details. Please try again.';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/jobs/financials']);
        }, 3000);
      }
    });
  }

  loadJobDetails(jobGuid: string): void {
    this.jobService.getByGuid(jobGuid).subscribe({
      next: (job) => {
        this.job = job;
      },
      error: (error) => {
        console.error('Error loading job details:', error);
      }
    });
  }

  loadComments(chargeGuid: string): void {
    // TODO: Replace with actual API call
    // Mock data for demonstration
    this.comments = [
      {
        id: '1',
        author: 'John Doe',
        text: 'Initial charge created and pending approval.',
        createdDate: new Date('2024-12-01T10:30:00')
      },
      {
        id: '2',
        author: 'Jane Smith',
        text: 'Amount verified against contract terms.',
        createdDate: new Date('2024-12-02T14:15:00')
      }
    ];

    /* Uncomment when API is ready
    this.jobService.getChargeComments(chargeGuid).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      }
    });
    */
  }

  loadAuditTrail(chargeGuid: string): void {
    // TODO: Replace with actual API call
    // Mock data for demonstration
    this.auditTrail = [
      {
        id: '1',
        action: 'Created',
        user: 'System',
        timestamp: new Date('2024-12-01T09:00:00'),
        description: 'Charge transaction created from job requirements'
      },
      {
        id: '2',
        action: 'Modified',
        user: 'John Doe',
        timestamp: new Date('2024-12-01T10:30:00'),
        description: 'Updated amount and description'
      },
      {
        id: '3',
        action: 'Approved',
        user: 'Jane Smith',
        timestamp: new Date('2024-12-02T14:15:00'),
        description: 'Approved for processing'
      }
    ];

    /* Uncomment when API is ready
    this.jobService.getChargeAuditTrail(chargeGuid).subscribe({
      next: (trail) => {
        this.auditTrail = trail;
      },
      error: (error) => {
        console.error('Error loading audit trail:', error);
      }
    });
    */
  }

  // ==================== CALCULATIONS ====================
  getTotalAmount(): number {
    if (!this.chargeTransaction) return 0;
    
    const amount = this.chargeTransaction.amount || 0;
    
    return amount;
  }

  // ==================== STATUS HELPERS ====================
  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'bi-check-circle';
      case 'pending':
      case 'for approval':
        return 'bi-clock';
      case 'cancelled':
      case 'inactive':
      case 'rejected':
        return 'bi-x-circle';
      case 'in progress':
      case 'in-progress':
        return 'bi-hourglass-split';
      case 'for releasing':
        return 'bi-send';
      case 'for liquidation':
        return 'bi-cash-coin';
      default:
        return 'bi-question-circle';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-success';
      case 'FOR APPROVAL':
      case 'PENDING':
        return 'bg-warning';
      case 'IN PROGRESS':
        return 'bg-primary';
      case 'FOR RELEASING':
        return 'bg-info';
      case 'FOR LIQUIDATION':
        return 'bg-info';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getTrailIcon(action: string): string {
    switch (action?.toLowerCase()) {
      case 'created':
        return 'bi-plus-circle';
      case 'modified':
      case 'updated':
        return 'bi-pencil';
      case 'approved':
        return 'bi-check-circle';
      case 'rejected':
        return 'bi-x-circle';
      case 'released':
        return 'bi-send';
      case 'liquidated':
        return 'bi-cash-coin';
      default:
        return 'bi-circle';
    }
  }

  getTrailMarkerClass(action: string): string {
    switch (action?.toLowerCase()) {
      case 'created':
        return 'created';
      case 'modified':
      case 'updated':
        return 'modified';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'released':
        return 'released';
      case 'liquidated':
        return 'liquidated';
      default:
        return 'modified';
    }
  }

  // ==================== COMMENT MANAGEMENT ====================
  addComment(): void {
    if (!this.newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User', // TODO: Get from auth service
      text: this.newComment.trim(),
      createdDate: new Date()
    };

    // TODO: Replace with actual API call
    this.comments.unshift(comment);
    this.newComment = '';

    /* Uncomment when API is ready
    this.jobService.addChargeComment(this.chargeGuid, comment).subscribe({
      next: (newComment) => {
        this.comments.unshift(newComment);
        this.newComment = '';
        this.addAuditEntry('Comment Added', 'Added new comment to transaction');
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        alert('Failed to add comment. Please try again.');
      }
    });
    */

    // Add audit trail entry
    this.addAuditEntry('Comment Added', 'Added new comment to transaction');
  }

  // ==================== WORKFLOW ACTIONS ====================
  canManageTransaction(): boolean {
    // TODO: Implement proper permission check
    return true;
  }

  canApprove(): boolean {
    return this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'FOR APPROVAL' ||
           this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'PENDING';
  }

  canReject(): boolean {
    return this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'FOR APPROVAL' ||
           this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'PENDING';
  }

  canRelease(): boolean {
    return this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'APPROVED';
  }

  canLiquidate(): boolean {
    return this.chargeTransaction?.chargeTransactionStatus?.toUpperCase() === 'FOR RELEASING';
  }

  approveTransaction(): void {
    if (!confirm('Are you sure you want to approve this transaction?')) {
      return;
    }

    // TODO: Replace with actual API call
    if (this.chargeTransaction) {
      this.chargeTransaction.chargeTransactionStatus = 'APPROVED';
      this.chargeTransaction.createdBy = 0; // TODO: Get from auth service
      
      this.addAuditEntry('Approved', 'Transaction approved for processing');
      alert('Transaction approved successfully!');
    }

    /* Uncomment when API is ready
    this.jobService.approveChargeTransaction(this.chargeGuid).subscribe({
      next: (response) => {
        this.chargeTransaction = response;
        this.addAuditEntry('Approved', 'Transaction approved for processing');
        alert('Transaction approved successfully!');
      },
      error: (error) => {
        console.error('Error approving transaction:', error);
        alert('Failed to approve transaction. Please try again.');
      }
    });
    */
  }

  rejectTransaction(): void {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) {
      return;
    }

    // TODO: Replace with actual API call
    if (this.chargeTransaction) {
      this.chargeTransaction.chargeTransactionStatus = 'REJECTED';
      this.addAuditEntry('Rejected', `Transaction rejected: ${reason}`);
      alert('Transaction rejected successfully!');
    }

    /* Uncomment when API is ready
    this.jobService.rejectChargeTransaction(this.chargeGuid, reason).subscribe({
      next: (response) => {
        this.chargeTransaction = response;
        this.addAuditEntry('Rejected', `Transaction rejected: ${reason}`);
        alert('Transaction rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting transaction:', error);
        alert('Failed to reject transaction. Please try again.');
      }
    });
    */
  }

  releaseTransaction(): void {
    if (!confirm('Are you sure you want to mark this transaction for releasing?')) {
      return;
    }

    // TODO: Replace with actual API call
    if (this.chargeTransaction) {
      this.chargeTransaction.chargeTransactionStatus = 'FOR RELEASING';
      this.addAuditEntry('Released', 'Transaction marked for releasing');
      alert('Transaction marked for releasing!');
    }

    /* Uncomment when API is ready
    this.jobService.releaseChargeTransaction(this.chargeGuid).subscribe({
      next: (response) => {
        this.chargeTransaction = response;
        this.addAuditEntry('Released', 'Transaction marked for releasing');
        alert('Transaction marked for releasing!');
      },
      error: (error) => {
        console.error('Error releasing transaction:', error);
        alert('Failed to release transaction. Please try again.');
      }
    });
    */
  }

  liquidateTransaction(): void {
    if (!confirm('Are you sure you want to mark this transaction for liquidation?')) {
      return;
    }

    // TODO: Replace with actual API call
    if (this.chargeTransaction) {
      this.chargeTransaction.chargeTransactionStatus = 'FOR LIQUIDATION';
      this.addAuditEntry('Liquidated', 'Transaction marked for liquidation');
      alert('Transaction marked for liquidation!');
    }

    /* Uncomment when API is ready
    this.jobService.liquidateChargeTransaction(this.chargeGuid).subscribe({
      next: (response) => {
        this.chargeTransaction = response;
        this.addAuditEntry('Liquidated', 'Transaction marked for liquidation');
        alert('Transaction marked for liquidation!');
      },
      error: (error) => {
        console.error('Error liquidating transaction:', error);
        alert('Failed to liquidate transaction. Please try again.');
      }
    });
    */
  }

  addAuditEntry(action: string, description: string): void {
    const entry: AuditTrail = {
      id: Date.now().toString(),
      action: action,
      user: 'Current User', // TODO: Get from auth service
      timestamp: new Date(),
      description: description
    };
    this.auditTrail.unshift(entry);
  }

  // ==================== PRINTING ====================
  printInvoice(): void {
    if (!this.chargeTransaction) {
      console.error('No charge transaction data to print');
      return;
    }

    this.http.get('assets/print-templates/charge-invoice.html', { responseType: 'text' })
      .subscribe({
        next: (template) => {
          const charge = this.chargeTransaction!;
          const job = this.job;

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

          // Calculate tax and total
          const amount = charge.amount || 0;
          const totalAmount = amount;

          // Replace placeholders in template
          let filledTemplate = template
            .replace('{{chargeCode}}', charge.chargeCode || '-')
            .replace('{{jobCode}}', job?.jobCode || '-')
            .replace('{{client}}', job?.customerName || '-')
            .replace('{{chargeType}}', charge.chargeSubCategoryName || '-')
            .replace('{{category}}', charge.chargeSubCategoryName || '-')
            .replace('{{description}}', charge.description || 'No description')
            .replace('{{amount}}', formatCurrency(amount))
            .replace('{{totalAmount}}', formatCurrency(totalAmount))
            .replace('{{status}}', charge.chargeTransactionStatus || 'Pending')
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