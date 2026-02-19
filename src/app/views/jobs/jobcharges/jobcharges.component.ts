import { Component, Input, OnChanges, OnInit, SimpleChanges, HostListener } from '@angular/core';
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
  selectedCategory: string = '';

  showSubmitClearingConfirmModal = false;
  showCashReleasingConfirmModal = false;
  showCashReleaseConfirmModal = false;
  showFinalClosingConfirmModal = false;
  showOwnLineChargeConfirmModal = false;
  selectedCharge: any = null;

  // Reactive Form
  chargeFormGroup!: FormGroup;

  // Toast Notifications
  showSuccessToast: boolean = false;
  showErrorToast: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';


  // Dropdown options

  categorySearch = '';
  categoryDropdownOpen = false;
  selectedSubCategory: any | null = null;
  chargeSubCategories: ChargeSubcategory[] = [];
  filteredCategories: ChargeSubcategory[] = [];

  filteredCharges: ChargeTransaction[] = [];

  showAuditLogModal = false;
  isLoadingAuditLog = false;
  auditLogs: ChargeTransactionAuditLog[] = [];

  refundAmount: number = 0;
  referenceNumber: string = '';
  refundNotes: string = '';

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
              && charge.amount > 0
              && charge.chargeCategoryName === "CHARGES";
          });
        }
      }
    } else {

      if (changes['charges'] && changes['charges'].currentValue) {
        this.filteredCharges = this.charges.filter(charge => {
          return charge.isForProcessing === true
            && charge.isActive === true
            && charge.amount > 0
            && charge.chargeCategoryName === "CHARGES";
        });
      }

    }
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

  canViewSellingAmount(): boolean {
    return ['SALES', 'FINANCE', 'TREASURER', 'ADMIN'].includes(this.userRole);
  }

  canProcessCharges(): boolean {

    return ['ADMIN', 'PROCESSOR', 'OPSMGR', 'CASHIER', 'TREASURER', 'FINANCE'].includes(this.userRole);
  }

  loadChargeSubCategories(): void {
    this.chargeService.getChargeSubcategories().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {

          this.chargeSubCategories = response.data
            .filter((item) => item.isActive === true && item.chargeCategoryId === 1)
            .sort((a, b) => a.chargeSubCategoryName.localeCompare(b.chargeSubCategoryName));

          this.filteredCategories = [...this.chargeSubCategories];
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
      jobId: [0],
      currency: ['PHP', Validators.required],
      conversionRate: [{ value: 1, disabled: false }, [Validators.required, Validators.min(0.0001)]],
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
      currency: 'PHP',
      conversionRate: 1
    });

    this.categorySearch = '';
    this.selectedSubCategory = null;
    this.filteredCategories = [...this.chargeSubCategories];
    this.categoryDropdownOpen = false;
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

  onRefundAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.refundAmount = parseFloat(input.value) || 0;
  }

  onReferenceNumberChange(event: Event): void {
    this.referenceNumber = (event.target as HTMLInputElement).value;
  }

  onRefundNotesChange(event: Event): void {
    this.refundNotes = (event.target as HTMLTextAreaElement).value;
  }

  createCharge(): void {
    const createRequest: CreateChargeTransactionRequest = {
      chargeSubCategoryId: this.chargeFormGroup.value.chargeSubCategoryId,
      description: this.chargeFormGroup.value.description,
      amount: this.chargeFormGroup.value.amount,
      amountSelling: 0,
      isForProcessing: true,
      jobId: this.job!.jobId,
      currencyCode: this.chargeFormGroup.value.currency,
      conversionRate: this.chargeFormGroup.value.conversionRate
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
      this.refundAmount = 0;
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

  openOwnChargeConfirmation(charge: any) {

    this.selectedCharge = charge;
    this.showOwnLineChargeConfirmModal = true;
  }

  closeOwnLineChargeConfirmModal() {
    if (!this.isSubmitting) {
      this.showOwnLineChargeConfirmModal = false;
      this.selectedCharge = null;
    }
  }

  confirmOwnLineCharge() {

    this.isSubmitting = true;

    this.chargeService.ownCharge(this.selectedCharge.chargeGuid).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showOwnLineChargeConfirmModal = false;

        if (response.data) {
          this.loadCharges();
          this.showSuccess('Trannsaction completed!');
          this.closeOwnLineChargeConfirmModal();
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

  openSubmitClearingConfirmation(charge: any) {
    this.selectedCharge = charge;
    console.log('Selected Charge for Clearing:', this.selectedCharge);
    this.showSubmitClearingConfirmModal = true;
  }

  closeSubmitClearingConfirmModal() {
    if (!this.isSubmitting) {
      this.showSubmitClearingConfirmModal = false;
      this.selectedCharge = null;
      this.refundAmount = 0;
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

    this.chargeService.submitForClearingCharge(this.selectedCharge.chargeGuid, this.refundAmount, this.referenceNumber, this.refundNotes).subscribe({
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

  onCategorySearchChange(searchValue: string): void {
    this.categorySearch = searchValue;
    this.categoryDropdownOpen = true;

    if (!searchValue.trim()) {
      this.filteredCategories = [...this.chargeSubCategories];
      return;
    }

    const searchLower = searchValue.toLowerCase();
    this.filteredCategories = this.chargeSubCategories.filter(category =>
      category.chargeSubCategoryName.toLowerCase().includes(searchLower)
    );
  }


  selectCategory(category: any): void {
    this.selectedCategory = category;
    this.categorySearch = category.chargeSubCategoryName;
    this.chargeFormGroup.patchValue({ chargeSubCategoryId: category.chargeSubCategoryId });
    this.categoryDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Close category dropdown if clicked outside
    if (!target.closest('.category-dropdown') && this.categoryDropdownOpen) {
      this.categoryDropdownOpen = false;
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