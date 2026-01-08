import { Component, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule, TableModule } from '@coreui/angular';
import { ChargeTransaction, ChargeTransactionAuditLog, CreateChargeTransactionRequest } from '../../../models/chargetransaction';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Job } from '../../../models/job';
import { ChargeTransactionService } from '../../../services/chargetransaction/chargetransaction.service';
import { finalize } from 'rxjs';
import { ChargeSubcategory } from '../../../models/chargesubcategory';

@Component({
  selector: 'app-job-charges',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, RouterLink, ReactiveFormsModule],
  templateUrl: './jobcharges.component.html',
  styleUrls: ['./jobcharges.component.scss']
})
export class JobChargesComponent implements OnInit, OnChanges {

  jobCode: string = '';

  // Loading & Modal States
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  showModal: boolean = false;

  showSubmitClearingConfirmModal = false;
  showCashReleasingConfirmModal = false;
  showCashReleaseConfirmModal = false;
  showFinalClosingConfirmModal = false;
  selectedCharge: any = null;

  // Reactive Form
  chargeFormGroup!: FormGroup;

  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';


  // Dropdown options
  chargeSubCategories: ChargeSubcategory[] = [];

  filteredCharges: ChargeTransaction[] = [];

  showAuditLogModal = false;
  isLoadingAuditLog = false;
  auditLogs: ChargeTransactionAuditLog[] = [];

  constructor(private fb: FormBuilder,

    private chargeService: ChargeTransactionService,
  ) {
    this.initializeForm();
  }

  @Input() job: Job | null = null;
  @Input() jobGuid: string = '';
  @Input() userRole: string = '';
  @Input() jobStatus: string = '';
  @Input() charges: ChargeTransaction[] = [];
  @Input() viewSummary: boolean = false;

  ngOnInit() {

    this.loadChargeSubCategories();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (this.viewSummary) {
      if ((this.userRole === 'ADMIN' || this.userRole === 'FINANCE' || this.userRole === 'TREASURER' || this.userRole === 'SALES')) {

        this.filteredCharges = this.charges;
      }
      else {
        if (changes['charges'] && changes['charges'].currentValue) {
          this.filteredCharges = this.charges.filter(charge => {
            return charge.isForProcessing === true
              && charge.isActive === true
              && charge.amount > 0;
          });
        }
      }
    } else {

      if (changes['charges'] && changes['charges'].currentValue) {
        this.filteredCharges = this.charges.filter(charge => {
          return charge.isForProcessing === true
            && charge.isActive === true
            && charge.amount > 0;
        });
      }

    }
  }

  get total(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.filteredCharges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.amount || 0), 0);
  }

  get totalChargeAmount(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.filteredCharges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.amount || 0), 0);
  }

  get totalSellingAmount(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.filteredCharges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.amountSelling || 0), 0);
  }

  getColspan(): number {
    let cols = 5;
    if (this.userRole === 'SALES' || this.userRole === 'FINANCE' || this.userRole === 'TREASURER' || this.userRole === 'ADMIN') {
      cols++; // Selling Amount
    }
    if (this.userRole === 'ADMIN' || this.userRole === 'PROCESSOR' || this.userRole === 'OPSMGR') {
      cols++; // Actions
    }
    return cols;
  }

  getFooterColspan(): number {
    return 4;
  }

  getActionTypeClass(actionType: string): string {
    const type = actionType?.toLowerCase() || '';
    if (type.includes('create')) return 'action-create';
    if (type.includes('complete')) return 'action-complete';
    if (type.includes('cancel')) return 'action-cancel';
    if (type.includes('approve')) return 'action-approve';
    return 'action-update';
  }

  getActionTypeBadge(actionType: string): string {
    const type = actionType?.toLowerCase() || '';
    if (type.includes('create')) return 'bg-success';
    if (type.includes('complete')) return 'bg-purple';
    if (type.includes('cancel')) return 'bg-danger';
    if (type.includes('approve')) return 'bg-info';
    return 'bg-primary';
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

  canViewSellingAmount(): boolean {
    return ['SALES', 'FINANCE', 'TREASURER', 'ADMIN'].includes(this.userRole);
  }

  canProcessCharges(): boolean {

    return ['ADMIN', 'PROCESSOR', 'OPSMGR', 'CASHIER', 'TREASURER', 'FINANCE'].includes(this.userRole);
  }

  processCharge(charge: ChargeTransaction) {
    // Your processing logic here
  }

  loadChargeSubCategories(): void {
    this.chargeService.getChargeSubcategories().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {

          this.chargeSubCategories = response.data
            .filter((item) => item.isActive === true && item.chargeCategoryId === 1)
            .sort((a, b) => a.chargeSubCategoryName.localeCompare(b.chargeSubCategoryName));
        }
      },
      error: (error) => {
        console.error('Error loading charge subcategories:', error);
      }
    });

  }

  initializeForm(): void {
    this.chargeFormGroup = this.fb.group({
      chargeSubCategoryId: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(500)],
      amount: [0, [Validators.required, Validators.min(0)]],
      amountSelling: [0, [Validators.required, Validators.min(0)]],
      isForProcessing: [false],
      jobId: [0]
    });
  }

  loadCharges(): void {
    this.isLoading = true;
    this.chargeService.getChargesByJobGuid(this.jobGuid)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.charges = response.data;
            if (response.data.length) {
              this.jobCode = response.data[0].jobCode;
              this.filteredCharges = this.charges.filter(charge => {
                return charge.isForProcessing === true
                  && charge.isActive === true
                  && charge.amount > 0;
              });
            }
          } else {
            this.charges = [];
            this.filteredCharges = [];
          }
        },
        error: (error) => {
          console.error('Error loading charges:', error);
        }
      });
  }

  openAddModal(): void {
    this.chargeFormGroup.reset({
      description: '',
      amount: 0,
      amountSelling: 0,
      jobId: 0,
      optionChargeStatusId: 0,
      isForProcessing: false,
    });
    this.showModal = true;
  }

  markFormGroupTouched(): void {
    Object.keys(this.chargeFormGroup.controls).forEach(key => {
      this.chargeFormGroup.get(key)?.markAsTouched();
    });
  }

  onSubmit(): void {
    if (!this.chargeFormGroup.valid) {
      this.showError('Please fill in all required fields correctly');
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    this.createCharge();
  }

  createCharge(): void {
    const createRequest: CreateChargeTransactionRequest = {
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: 0,
      isForProcessing: true,
      jobId: this.job!.jobId,
    };

    if (this.job?.jobId === undefined || this.job?.jobId === null) {
      this.showError('Job ID is not available. Cannot create charge.');
      this.isSubmitting = false;
      return;
    }

    this.chargeService.createCharge(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.loadCharges();
            this.showSuccess(`New charge has been created!`);
            this.closeModal();
          } else {
            this.showError(response.message || 'Failed to create charge');
          }
        },
        error: (error) => {
          console.error('Error creating charge:', error);
          this.showError(error?.error?.Message || 'Failed to create charge');
        }
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.chargeFormGroup.reset();
  }

  openCashReleasingConfirmation(charge: any) {
    this.selectedCharge = charge;
    this.showCashReleasingConfirmModal = true;
  }

  closeCashReleasingConfirmModal() {
    if (!this.isSubmitting) {
      this.showCashReleasingConfirmModal = false;
      this.selectedCharge = null;
    }
  }

  proceedToReview() {

    if (!this.selectedCharge) return;

    this.isSubmitting = true;

    this.chargeService.releaseCashCharge(this.selectedCharge.chargeGuid).subscribe({
      next: (response) => {

        this.isSubmitting = false;
        this.showCashReleasingConfirmModal = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess('Charge has been released for cashing!');
          this.closeCashReleasingConfirmModal();
        }
        else {
          this.showError(response.message || 'Failed to release charge for cashing');
        }
      },
      error: (error) => {
        console.error('Error releasing charge for cashing:', error);
        this.showError(error?.error?.Message || 'Failed to release charge for cashing');
      }
    });
  }

  openCashReleaseConfirmation(charge: any) {
    this.selectedCharge = charge;
    this.showCashReleaseConfirmModal = true;
  }

  closeCashReleaseConfirmModal() {
    if (!this.isSubmitting) {
      this.showCashReleaseConfirmModal = false;
      this.selectedCharge = null;
    }
  }

  confirmCashRelease() {
    this.isSubmitting = true;

    this.chargeService.confirmCashReleaseCharge(this.selectedCharge.chargeGuid).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showCashReleaseConfirmModal = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess('Cash has been released to processor!');
          this.closeCashReleaseConfirmModal();
        }
        else {
          this.showError(response.message || 'Failed to release charge for cashing');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError(error?.error?.Message || 'Failed to release charge for cashing');
      }
    });
  }

  openSubmitClearingConfirmation(charge: any) {
    this.selectedCharge = charge;
    this.showSubmitClearingConfirmModal = true;
  }

  closeSubmitClearingConfirmModal() {
    if (!this.isSubmitting) {
      this.showSubmitClearingConfirmModal = false;
      this.selectedCharge = null;
    }
  }

  openFinalClosingConfirmation(charge: any) {
    this.selectedCharge = charge;
    this.showFinalClosingConfirmModal = true;
  }

  closeFinalClosingConfirmModal() {
    if (!this.isSubmitting) {
      this.showFinalClosingConfirmModal = false;
      this.selectedCharge = null;
    }
  }

  confirmFinalClosing() {
    this.isSubmitting = true;

    this.chargeService.completeCharge(this.selectedCharge.chargeGuid).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showSubmitClearingConfirmModal = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess('Trannsaction completed!');
          this.closeFinalClosingConfirmModal();
        }
        else {
          this.showError(response.message || 'Failed to complete transaction');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError(error?.error?.Message || 'Failed to complete transaction');
      }
    });

  }

  confirmSubmitClearing() {
    this.isSubmitting = true;

    this.chargeService.submitForClearingCharge(this.selectedCharge.chargeGuid).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showSubmitClearingConfirmModal = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess('Cash has been released to processor!');
          this.closeCashReleaseConfirmModal();
        }
        else {
          this.showError(response.message || 'Failed to release charge for cashing');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError(error?.error?.Message || 'Failed to release charge for cashing');
      }
    });
  }

  openAuditLogModal(charge: ChargeTransaction): void {
    this.selectedCharge = charge;
    this.showAuditLogModal = true;
    this.loadAuditLogs(charge.chargeId);
  }

  closeAuditLogModal(): void {
    this.showAuditLogModal = false;
    this.auditLogs = [];
  }

  loadAuditLogs(chargeId: number): void {
    this.isLoadingAuditLog = true;
    this.chargeService.getChargeAuditLog(chargeId).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.auditLogs = response.data;

        }
        this.isLoadingAuditLog = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.isLoadingAuditLog = false;
      }
    });
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