import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add this import
import { ChargeTransaction, CreateChargeTransactionRequest, UpdateChargeTransactionRequest } from '../../../../models/chargetransaction';
import { ChargeTransactionService } from '../../../../services/chargetransaction/chargetransaction.service';


@Component({
  selector: 'app-jobchargesmanagement',
  imports: [CommonModule, FormsModule],
  templateUrl: './jobchargesmanagement.component.html',
  styleUrl: './jobchargesmanagement.component.scss'
})
export class JobchargesmanagementComponent implements OnInit {

  jobGuid: string = '';
  charges: ChargeTransaction[] = [];
  filteredCharges: ChargeTransaction[] = [];
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  searchTerm: string = '';
  
  selectedCharge: ChargeTransaction | null = null;
  chargeForm: CreateChargeTransactionRequest | UpdateChargeTransactionRequest = this.getEmptyForm();

  // Dropdown options (load from your service/API)
  chargeSubcategories: any[] = [];
  chargeStatuses: any[] = [];
  currencyCodes: string[] = ['PHP', 'USD', 'EUR', 'JPY'];

  constructor(
    private route: ActivatedRoute,
    private chargeService: ChargeTransactionService
  ) {}

  ngOnInit(): void {
    this.jobGuid = this.route.snapshot.paramMap.get('jobGuid') || '';
    this.loadCharges();
    this.loadDropdownOptions();
  }

  loadCharges(): void {
    this.isLoading = true;
    this.chargeService.getChargesByJobGuid(this.jobGuid).subscribe({
      next: (response) => {
        this.charges = response.data || [];
        this.filteredCharges = [...this.charges];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading charges:', error);
        this.isLoading = false;
      }
    });
  }

  loadDropdownOptions(): void {
    // Load charge subcategories and statuses from your service
    // Example:
    // this.chargeService.getChargeSubcategories().subscribe(...)
    // this.chargeService.getChargeStatuses().subscribe(...)
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCharges = this.charges.filter(charge =>
      charge.chargeCode?.toLowerCase().includes(term) ||
      charge.description?.toLowerCase().includes(term) ||
      charge.chargeSubCategoryName?.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.chargeForm = this.getEmptyForm();
    this.showModal = true;
  }

  openEditModal(charge: ChargeTransaction): void {
    this.isEditMode = true;
    this.selectedCharge = charge;
    this.chargeForm = {
      chargeId: charge.chargeId,
      chargeGuid: charge.chargeGuid,
      chargeCode: charge.chargeCode,
      chargeSubCategoryId: charge.chargeSubCategoryId,
      description: charge.description || '',
      amount: charge.amount,
      currencyCode: charge.currencyCode,
      jobId: charge.jobId,
      optionChargeStatusId: charge.optionChargeStatusId,
      chargeTransactionCategoryCode: charge.chargeTransactionCategoryCode,
      isActive: charge.isActive
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCharge = null;
    this.chargeForm = this.getEmptyForm();
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.updateCharge();
    } else {
      this.createCharge();
    }
  }

  createCharge(): void {
    this.isLoading = true;
    this.chargeService.createCharge(this.chargeForm as CreateChargeTransactionRequest).subscribe({
      next: (response) => {
        this.loadCharges();
        this.closeModal();
        this.isLoading = false;
        // Show success message
      },
      error: (error) => {
        console.error('Error creating charge:', error);
        this.isLoading = false;
        // Show error message
      }
    });
  }

  updateCharge(): void {
    this.isLoading = true;
    this.chargeService.updateCharge("" , this.chargeForm as UpdateChargeTransactionRequest).subscribe({
      next: (response) => {
        this.loadCharges();
        this.closeModal();
        this.isLoading = false;
        // Show success message
      },
      error: (error) => {
        console.error('Error updating charge:', error);
        this.isLoading = false;
        // Show error message
      }
    });
  }

  deleteCharge(charge: ChargeTransaction): void {
    if (confirm(`Are you sure you want to delete charge ${charge.chargeCode}?`)) {
      this.isLoading = true;
      this.chargeService.deleteCharge(charge.chargeGuid).subscribe({
        next: () => {
          this.loadCharges();
          this.isLoading = false;
          // Show success message
        },
        error: (error) => {
          console.error('Error deleting charge:', error);
          this.isLoading = false;
          // Show error message
        }
      });
    }
  }

  get total(): number {
    return this.filteredCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'CANCELLED': return 'bg-danger';
      case 'COMPLETED': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  private getEmptyForm(): CreateChargeTransactionRequest {
    return {
      chargeCode: '',
      chargeSubCategoryId: 0,
      description: '',
      amount: 0,
      currencyCode: 'PHP',
      jobId: 0,
      optionChargeStatusId: 0,
      chargeTransactionCategoryCode: null,
      isActive: true
    };
  }
}
