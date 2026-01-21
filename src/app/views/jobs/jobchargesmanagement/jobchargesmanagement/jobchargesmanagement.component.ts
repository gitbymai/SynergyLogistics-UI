import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChargeTransaction, ChargeTransactionAuditLog, CreateChargeTransactionRequest, UpdateChargeTransactionRequest } from '../../../../models/chargetransaction';
import { ChargeTransactionService } from '../../../../services/chargetransaction/chargetransaction.service';
import { JobsService } from '../../../../services/jobs/jobs.service';
import { Job } from '../../../../models/job';
import { ChargeSubcategory } from '../../../../models/chargesubcategory';



@Component({
  selector: 'app-jobchargesmanagement',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './jobchargesmanagement.component.html',
  styleUrls: ['./jobchargesmanagement.component.scss']
})
export class JobchargesmanagementComponent implements OnInit {

  jobDetails: Job | null = null;
  jobGuid: string = '';
  jobCode: string = '';
  jobId: number = 0;
  charges: ChargeTransaction[] = [];
  filteredCharges: ChargeTransaction[] = [];

  // Loading & Modal States
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  showModal: boolean = false;
  showDeleteConfirmModal: boolean = false;
  isEditMode: boolean = false;
  activeTab: 'details' | 'audit' = 'details'

  showViewModal = false;
  chargeAuditLogs: ChargeTransactionAuditLog[] = [];

  // Search & Filter
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  // Selected Charge for edit/delete
  selectedCharge: ChargeTransaction | null = null;

  // Reactive Form
  chargeFormGroup!: FormGroup;
  reviewFormGroup!: FormGroup;

  showReviewModal = false;
  reviewAction: 'approve' | 'reject' | null = null;

  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Dropdown options
  chargeSubCategories: ChargeSubcategory[] = [];

  constructor(
    private route: ActivatedRoute,
    private chargeService: ChargeTransactionService,
    private fb: FormBuilder,
    private jobService: JobsService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.jobGuid = this.route.snapshot.paramMap.get('jobGuid') || '';
    this.loadJobDetails();
  }

  initializeForm(): void {
    this.chargeFormGroup = this.fb.group({
      chargeSubCategoryId: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(500)],
      currency: ['', Validators.required],
      conversionRate: [{ value: 1, disabled: false }, [Validators.required, Validators.min(0.0001)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      amountSelling: [0, [Validators.required, Validators.min(0)]],
      isForProcessing: [false],
      jobId: [0]
    });

    this.reviewFormGroup = this.fb.group({
      reviewRemarks: ['']
    });

    // Listen to currency changes
    this.chargeFormGroup.get('currency')?.valueChanges.subscribe(currency => {
      this.onCurrencyChange(currency);
    });
  }

  onCurrencyChange(currency: string): void {
    const conversionRateControl = this.chargeFormGroup.get('conversionRate');

    if (currency === 'PHP') {
      conversionRateControl?.setValue(1);
      conversionRateControl?.disable();
      conversionRateControl?.clearValidators();
    } else {
      conversionRateControl?.enable();
      conversionRateControl?.setValidators([Validators.required, Validators.min(0.0001)]);
    }

    conversionRateControl?.updateValueAndValidity();
  }
  
  loadJobDetails(): void {
    this.jobService.getByGuid(this.jobGuid).subscribe({
      next: (response) => {
        if (!response) {
          this.router.navigate(['/dashboard']);
          return;
        }
        this.jobDetails = response;
        this.jobId = response.jobId;
        this.loadCharges();
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.router.navigate(['/dashboard']);
      }
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
            this.filteredCharges = this.charges;
            if (response.data.length) {
              this.jobCode = response.data[0].jobCode;
              this.loadChargeSubCategories();
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

  loadChargeSubCategories() {
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
  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCharge = null;
    this.chargeFormGroup.reset({
      description: '',
      amount: 0,
      amountSelling: 0,
      jobId: 0,
      optionChargeStatusId: 0,
      isForProcessing: false,
    });
    this.chargeFormGroup.get('chargeCode')?.enable();
    this.chargeFormGroup.get('isForProcessing')?.enable();
    this.showModal = true;
  }

  openEditModal(charge: ChargeTransaction): void {
    this.isEditMode = true;
    this.selectedCharge = charge;

    this.chargeFormGroup.patchValue({
      chargeSubCategoryId: charge.chargeSubCategoryId,
      description: charge.description || '',
      amount: charge.amount,
      amountSelling: charge.amountSelling || 0,
      jobId: charge.jobId,
      currency: charge.currencyCode,
      conversionRate: charge.conversionRate,
      isForProcessing: charge.isForProcessing || false,
    });

    // Disable charge code in edit mode
    this.chargeFormGroup.get('chargeCode')?.disable();
    this.chargeFormGroup.get('isForProcessing')?.disable();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCharge = null;
    this.chargeFormGroup.reset();
    this.chargeFormGroup.get('chargeCode')?.enable();
  }

  openReviewModal(charge: any) {

    this.selectedCharge = charge;
    this.reviewAction = null;
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.reviewFormGroup.reset();
    this.showReviewModal = false;
    this.selectedCharge = null;
    this.reviewAction = null;
  }

  approveCharge() {
    if (!this.selectedCharge) return;

    this.isSubmitting = true;
    this.reviewAction = 'approve';

    this.chargeService.approveCharge(this.selectedCharge.chargeGuid, this.reviewFormGroup.get('reviewRemarks')?.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess(`Charge has been approved successfully`);
          this.closeReviewModal();
        } else {
          this.showError(response.message || 'Failed to approve charge');
        }
      },
      error: (error) => {
        console.error('Error approving charge:', error);
        this.showError(error?.error?.Message || 'Failed to approve charge');
      }
    });
  }

  rejectCharge() {
    if (!this.selectedCharge) return;

    this.isSubmitting = true;
    this.reviewAction = 'reject';

    this.chargeService.rejectCharge(this.selectedCharge.chargeGuid, this.reviewFormGroup.get('reviewRemarks')?.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess(`Charge has been rejected`);
          this.closeReviewModal();
        } else {
          this.showError(response.message || 'Failed to reject charge');
        }
      },
      error: (error) => {
        console.error('Error rejectinng charge:', error);
        this.showError(error?.error?.Message || 'Failed to reject charge');
      }
    });
  }

  onSubmit(): void {
    if (!this.chargeFormGroup.valid) {
      this.showError('Please fill in all required fields correctly');
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      this.updateCharge();
    } else {
      this.createCharge();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.chargeFormGroup.controls).forEach(key => {
      this.chargeFormGroup.get(key)?.markAsTouched();
    });
  }

  createCharge(): void {
    const createRequest: CreateChargeTransactionRequest = {
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: this.chargeFormGroup.value.amountSelling,
      isForProcessing: this.chargeFormGroup.value.isForProcessing,
      currencyCode: this.chargeFormGroup.value.currency,
      conversionRate: this.chargeFormGroup.value.conversionRate,
      jobId: this.jobId,
    };

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
          this.showError(error?.error?.Message || 'Failed to create charge');
        }
      });
  }

  updateCharge(): void {
    if (!this.selectedCharge) return;

    const updateRequest: UpdateChargeTransactionRequest = {
      chargeId: this.selectedCharge.chargeId,
      chargeGuid: this.selectedCharge.chargeGuid,
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: this.chargeFormGroup.value.amountSelling,
      isForProcessing: this.selectedCharge.isForProcessing || false,
      jobId: this.selectedCharge.jobId,
      currencyCode: this.chargeFormGroup.value.currency,
      conversionRate: this.chargeFormGroup.value.conversionRate
    };

    this.chargeService.updateCharge(this.selectedCharge.chargeGuid, updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.loadCharges();
            this.showSuccess(`Charge has been updated successfully`);
            this.closeModal();
          } else {
            this.showError(response.message || 'Failed to update charge');
          }
        },
        error: (error) => {
          console.error('Error updating charge:', error);
          this.showError(error?.error?.Message || 'Failed to update charge');
        }
      });
  }

  deleteCharge(charge: ChargeTransaction): void {
    this.selectedCharge = charge;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.selectedCharge = null;
  }

  confirmDelete(): void {
    if (!this.selectedCharge) return;

    this.isSubmitting = true;
    const chargeCode = this.selectedCharge.chargeCode;

    this.chargeService.cancelCharge(this.selectedCharge.chargeGuid)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.loadCharges();
          this.showSuccess(`Charge ${chargeCode} cancelled successfully`);
          this.closeDeleteConfirm();
        },
        error: (error) => {
          console.error('Error cancelling charge:', error);
          this.showError(error?.error?.Message || 'Failed to cancel charge');
        }
      });
  }

   openViewModal(charge: ChargeTransaction): void {
 this.selectedCharge = charge;
    this.activeTab = 'details'; // Reset to details tab
    this.loadAuditLogs(charge.chargeId);
    this.showViewModal = true;
  }

  closeViewModal(): void {
   this.showViewModal = false;
    this.selectedCharge = null;
    this.chargeAuditLogs = [];
    this.activeTab = 'details';
  }


  loadAuditLogs(chargeId: number): void {
    // Call your service to load audit logs
    this.chargeService.getChargeAuditLog(chargeId).subscribe({
      next: (response) => {
        this.chargeAuditLogs = response.data;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });
  }

  get totalChargeAmount(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.filteredCharges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.calculatedAmount || 0), 0);
  }

  get totalSellingAmount(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.filteredCharges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.calculatedSellingAmount || 0), 0);
  }

  getStatusClass(status: string | null | undefined): string {
     if (!status) return 'bg-secondary';

    switch (status?.toUpperCase()) {
      case 'FOR APPROVAL': return 'badge-for-approval';
      case 'FOR CLEARING': return 'badge-released';
      case 'CLEARED': return 'badge-cleared';
      case 'REJECTED': return 'badge-rejected';
      case 'COMPLETED': return 'badge-completed';
      case 'FOR RELEASING': return 'badge-for-releasing';
      case 'CASH RECEIVED - FOR LIQUIDATION': return 'badge-for-liquidation';
      case 'CANCELLED': return 'badge-cancelled';
      case 'APPROVED': return 'badge-approved';
      case 'PENDING': return 'badge-pending';
      case 'RELEASED': return 'badge-released';
      default: return 'badge-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'FOR APPROVAL': return 'bi-clock-history';
      case 'FOR CLEARING': return 'bi-send-check';
      case 'CLEARED': return 'bi-check2-circle';
      case 'REJECTED': return 'bi-x-circle';
      case 'COMPLETED': return 'bi-check-circle-fill';
      case 'FOR RELEASING': return 'bi-box-arrow-right';
      case 'CASH RECEIVED - FOR LIQUIDATION': return 'bi-currency-dollar';
      case 'CANCELLED': return 'bi-dash-circle';
      case 'APPROVED': return 'bi-check-circle';
      default: return 'bi-question-circle';
    }
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