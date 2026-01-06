import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChargeTransaction, CreateChargeTransactionRequest, UpdateChargeTransactionRequest } from '../../../../models/chargetransaction';
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

  // Search & Filter
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';

  // Selected Charge for edit/delete
  selectedCharge: ChargeTransaction | null = null;

  // Reactive Form
  chargeFormGroup!: FormGroup;

  showReviewModal = false;
  reviewRemarks = '';
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
      amount: [0, [Validators.required, Validators.min(0)]],
      amountSelling: [0, [Validators.required, Validators.min(0)]],
      isForProcessing: [false],
      jobId: [0]
    });
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
    this.reviewRemarks = '';
    this.reviewAction = null;
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedCharge = null;
    this.reviewRemarks = '';
    this.reviewAction = null;
  }

  approveCharge() {
    if (!this.selectedCharge) return;

    this.isSubmitting = true;
    this.reviewAction = 'approve';

    this.chargeService.approveCharge(this.selectedCharge.chargeGuid).subscribe({
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

   this.chargeService.rejectCharge(this.selectedCharge.chargeGuid).subscribe({
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

  private markFormGroupTouched(): void {
    Object.keys(this.chargeFormGroup.controls).forEach(key => {
      this.chargeFormGroup.get(key)?.markAsTouched();
    });
  }

  private createCharge(): void {
    const createRequest: CreateChargeTransactionRequest = {
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: this.chargeFormGroup.value.amountSelling,
      isForProcessing: this.chargeFormGroup.value.isForProcessing,
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

  private updateCharge(): void {
    if (!this.selectedCharge) return;

    const updateRequest: UpdateChargeTransactionRequest = {
      chargeId: this.selectedCharge.chargeId,
      chargeGuid: this.selectedCharge.chargeGuid,
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: this.chargeFormGroup.value.amountSelling,
      isForProcessing: this.selectedCharge.isForProcessing || false,
      jobId: this.selectedCharge.jobId
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

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bi-check-circle';
      case 'PENDING': return 'bi-clock';
      case 'CANCELLED': return 'bi-x-circle';
      case 'COMPLETED': return 'bi-check-all';
      default: return 'bi-question-circle';
    }
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 4000);
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.showErrorToast = true;
    setTimeout(() => {
      this.showErrorToast = false;
    }, 4000);
  }
}