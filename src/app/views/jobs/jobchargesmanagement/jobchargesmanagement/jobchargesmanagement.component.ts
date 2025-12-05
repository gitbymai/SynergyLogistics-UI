import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChargeTransaction, CreateChargeTransactionRequest, UpdateChargeTransactionRequest } from '../../../../models/chargetransaction';
import { ChargeTransactionService } from '../../../../services/chargetransaction/chargetransaction.service';
import { JobsService } from '../../../../services/jobs/jobs.service';
import { Job } from '../../../../models/job';

interface ChargeSubcategory {
  id: number;
  name: string;
}

interface ChargeStatus {
  id: number;
  name: string;
}

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

  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Dropdown options
  chargeSubcategories: ChargeSubcategory[] = [];
  chargeStatuses: ChargeStatus[] = [];
  currencyCodes: string[] = ['PHP', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'SGD'];

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
    this.loadCharges();
    this.loadJobDetails();
    this.loadDropdownOptions();
  }

  initializeForm(): void {
    this.chargeFormGroup = this.fb.group({
      chargeSubCategoryId: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.maxLength(500)],
      amount: [0, [Validators.required, Validators.min(0)]],
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
            if (response.data.length) {
              this.jobCode = response.data[0].jobCode;
            }
            this.applyFilters();
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

  loadDropdownOptions(): void {

    //this.chargeSubcategories = [];
    // Load charge subcategories from service
    // Example:
    // this.chargeService.getChargeSubcategories().subscribe({
    //   next: (response) => {
    //     if (response.success && response.data) {
    //       this.chargeSubcategories = response.data;
    //     }
    //   },
    //   error: (error) => console.error('Error loading subcategories:', error)
    // });

    // Load charge statuses from service
    // Example:
    // this.chargeService.getChargeStatuses().subscribe({
    //   next: (response) => {
    //     if (response.success && response.data) {
    //       this.chargeStatuses = response.data;
    //     }
    //   },
    //   error: (error) => console.error('Error loading statuses:', error)
    // });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredCharges = this.charges.filter(charge => {
      const matchSearch =
        charge.chargeCode?.toLowerCase().includes(term) ||
        charge.description?.toLowerCase().includes(term) ||
        charge.chargeSubCategoryName?.toLowerCase().includes(term);

      const matchCategory = !this.selectedCategory ||
        charge.chargeSubCategoryId?.toString() === this.selectedCategory;

      const matchStatus = !this.selectedStatus ||
        charge.optionChargeStatusId?.toString() === this.selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedCharge = null;
    this.chargeFormGroup.reset({
      description: '',
      amount: 0,
      jobId: 0,
      optionChargeStatusId: 0,
    });
    this.chargeFormGroup.get('chargeCode')?.enable();
    this.showModal = true;
  }

  openEditModal(charge: ChargeTransaction): void {
    this.isEditMode = true;
    this.selectedCharge = charge;

    this.chargeFormGroup.patchValue({
      chargeSubCategoryId: charge.chargeSubCategoryId,
      description: charge.description || '',
      amount: charge.amount,
      jobId: charge.jobId
    });

    // Disable charge code in edit mode
    this.chargeFormGroup.get('chargeCode')?.disable();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCharge = null;
    this.chargeFormGroup.reset();
    this.chargeFormGroup.get('chargeCode')?.enable();
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
      jobId: this.jobId,
    };

    this.chargeService.createCharge(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.loadCharges();
            this.showSuccess(`Charge ${createRequest.chargeSubCategoryId} created successfully`);
            this.closeModal();
          } else {
            this.showError(response.message || 'Failed to create charge');
          }
        },
        error: (error) => {
          console.error('Error creating charge:', error);
          this.showError(error?.error?.message || 'Failed to create charge');
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
      jobId: this.chargeFormGroup.value.jobId
    };


    this.chargeService.updateCharge(this.selectedCharge.chargeGuid, updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.loadCharges();
            this.showSuccess(`Charge ${updateRequest.chargeId} updated successfully`);
            this.closeModal();
          } else {
            this.showError(response.message || 'Failed to update charge');
          }
        },
        error: (error) => {
          console.error('Error updating charge:', error);
          this.showError(error?.error?.message || 'Failed to update charge');
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
          this.showError(error?.error?.message || 'Failed to cancel charge');
        }
      });
  }

get total(): number {
  const excludedStatuses = ['CANCELLED', 'REJECTED'];
  return this.filteredCharges
    .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
    .reduce((sum, charge) => sum + (charge.amount || 0), 0);
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