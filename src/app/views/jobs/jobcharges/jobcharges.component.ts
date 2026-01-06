import { Component, input, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CardModule, TableModule } from '@coreui/angular';
import { ChargeTransaction, CreateChargeTransactionRequest } from '../../../models/chargetransaction';
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
export class JobChargesComponent implements OnInit {

  jobCode: string = '';

  // Loading & Modal States
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  showModal: boolean = false;

  // Reactive Form
  chargeFormGroup!: FormGroup;


  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';


  // Dropdown options
  chargeSubcategories: ChargeSubcategory[] = [];

  constructor(private fb: FormBuilder,

    private chargeService: ChargeTransactionService,
  ) {
    this.initializeForm();
  }


  get total(): number {
    const excludedStatuses = ['CANCELLED', 'REJECTED'];
    return this.charges
      .filter(charge => !excludedStatuses.includes(charge.chargeTransactionStatus!))
      .reduce((sum, charge) => sum + (charge.amount || 0), 0);
  }
  @Input() job: Job = {} as Job;
  @Input() jobGuid: string = '';
  @Input() userRole: string = '';
  @Input() jobStatus: string = '';
  @Input() charges: ChargeTransaction[] = [];

  ngOnInit() {

    this.loadChargeSubCategories();
  }


  loadChargeSubCategories(): void{
    this.chargeService.getChargeSubcategories().subscribe({
      next: (response) => {
        if (response.data) {
          this.chargeSubcategories = response.data;
        } else {
          this.chargeSubcategories = [];
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
      jobId: [0]
    });
  }

  openModal(): void {
    this.chargeFormGroup.reset({
      description: '',
      amount: 0,
      jobId: 0,
      optionChargeStatusId: 0,
    });
    this.chargeFormGroup.get('chargeCode')?.enable();
    this.showModal = true;
  }

  private markFormGroupTouched(): void {
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

  private createCharge(): void {
    const createRequest: CreateChargeTransactionRequest = {
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: this.chargeFormGroup.value.amountSelling,
      jobId: this.job.jobId,
    };

    this.chargeService.createCharge(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.data) {
            // this.loadCharges();
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

  //   loadCharges(): void {
  //   this.isLoading = true;
  //   this.chargeService.getChargesByJobGuid(this.jobGuid)
  //     .pipe(finalize(() => this.isLoading = false))
  //     .subscribe({
  //       next: (response) => {
  //         if (response.data) {
  //           this.charges = response.data;
  //           if (response.data.length) {
  //             this.jobCode = response.data[0].jobCode;
  //             this.getChargeSubcategories();
  //           }
  //         } else {
  //           this.charges = [];
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error loading charges:', error);
  //       }
  //     });
  // }

  // getChargeSubcategories(): void {
  //   if (this.charges && this.charges.length > 0) {
  //     const uniqueMap = new Map<number, string>();

  //     this.charges.forEach(charge => {
  //       if (!uniqueMap.has(charge.chargeSubCategoryId)) {
  //         uniqueMap.set(charge.chargeSubCategoryId, charge.chargeSubCategoryName!);
  //       }
  //     });

  //     this.chargeSubcategories = Array.from(uniqueMap, ([id, name]) => ({ id, name }));
  //   }
  // }

  closeModal(): void {
    this.showModal = false;
    this.chargeFormGroup.reset();
    this.chargeFormGroup.get('chargeCode')?.enable();
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