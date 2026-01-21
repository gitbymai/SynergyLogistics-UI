import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Ictsi,
  NewIctsi,
  UpdateIctsi
} from '../../../models/ictsi';
import { finalize } from 'rxjs';
import { IctsiService } from '../../../services/ictsi/ictsi.service';

@Component({
  selector: 'app-ictsi-lists',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ictsi-lists.component.html',
  styleUrl: './ictsi-lists.component.scss',
})
export class IctsiListsComponent {
  ictsiForm!: FormGroup;
  ictsisList: Ictsi[] = [];
  filteredIctsi: Ictsi[] = [];

  showIctsiModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;

  selectedIctsi: Ictsi | null = null;

  // Toast Notifications
  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;


  constructor(private fb: FormBuilder,
    private ictsiService: IctsiService,
    private router: Router) {
    this.initializeForm();
  }
  ngOnInit(): void {
    this.loadRecords();
  }

  initializeForm(): void {
    this.ictsiForm = this.fb.group({
      ictsiName: ['', [Validators.required, Validators.maxLength(100)]],
      addedAmount: ['', [Validators.required, Validators.min(0), Validators.max(9999999999999999.99)]],
      currentAmount: ['', [Validators.required, Validators.min(0), Validators.max(9999999999999999.99)]],
      isActive: [true]
    });
  }

  loadRecords(): void {
    this.isLoading = true;

    this.ictsiService.getAllIctsi().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.ictsisList = response.data;
          this.filteredIctsi = [...this.ictsisList];
          this.totalItems = this.ictsisList.length;
        } else {
          this.showError(response.message || 'Failed to load records');
        }
      },
      error: (error) => {
        console.error('Error loading records:', error);
        this.showError('Failed to load records. Please try again.');
      }
    })

  }
  openNewIctsiModal(): void {
    this.isEditMode = false;
    this.selectedIctsi = null;
    this.ictsiForm.reset({ isActive: true });
    this.ictsiForm.get('addedAmount')?.enable();
    this.showIctsiModal = true;
  }

  editIctsi(ictsi: Ictsi): void {
    this.isEditMode = true;
    this.selectedIctsi = ictsi;

    this.ictsiForm.patchValue({
      ictsiName: ictsi.ictsiName,
      addedAmount: ictsi.addedAmount,
      currentAmount: ictsi.currentAmount,
      isActive: ictsi.isActive
    });

    // Disable addedAmount in edit mode
    this.ictsiForm.get('addedAmount')?.disable();
    this.showIctsiModal = true;
  }
  submitForm(): void {
    if (!this.ictsiForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedIctsi) {
      this.updateIctsi();
    } else {
      this.createIctsi();
    }
  }

  createIctsi(): void {
    const createRequest: NewIctsi = {
      ictsiName: this.ictsiForm.value.ictsiName,
      addedAmount: this.ictsiForm.value.addedAmount,
      currentAmount: this.ictsiForm.value.currentAmount
    };

    this.ictsiService.createIctsi(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.ictsisList.push(response.data);
            this.totalItems = this.ictsisList.length;
            this.filteredIctsi = [...this.ictsisList];
            this.totalItems = this.ictsisList.length;

            this.showSuccess(`Record ${response.data.ictsiName} created successfully`);

            this.closeIctsiModal();
          } else {
            this.showError(response.message || 'Failed to create record');
          }
        },
        error: (error) => {
          console.error('Error creating record:', error);
          this.showError(error?.error?.message || 'Failed to create record');
        }
      });
  }

  updateIctsi(): void {
    if (!this.selectedIctsi) return;

    const updateRequest: UpdateIctsi = {
      ictsiId: this.selectedIctsi.ictsiId,
      ictsiGuid: this.selectedIctsi.ictsiGuid,
      ictsiName: this.ictsiForm.value.ictsiName,
      currentAmount: this.ictsiForm.value.currentAmount,
      isActive: this.ictsiForm.value.isActive
    };

    this.ictsiService.updateIctsi(updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.ictsisList.findIndex(r => r.ictsiId === this.selectedIctsi!.ictsiId);
            if (index !== -1) {
              this.ictsisList[index] = response.data;
            }
            this.showSuccess(`Record ${response.data.ictsiName} updated successfully`);
            this.closeIctsiModal();
          } else {
            this.showError(response.message || 'Failed to update record');
          }
        },
        error: (error) => {
          console.error('Error updating record:', error);
          this.showError(error?.error?.message || 'Failed to update record');
        }
      });
  }

  closeIctsiModal(): void {
    this.showIctsiModal = false;
    this.ictsiForm.reset();
    this.selectedIctsi = null;
    this.isEditMode = false;
    this.ictsiForm.get('addedAmount')?.enable();
  }

  openDeleteConfirm(ictsi: Ictsi): void {
    this.selectedIctsi = ictsi;
    this.showDeleteConfirmModal = true;
  }

  deleteResource(ictsi: Ictsi): void {
    this.openDeleteConfirm(ictsi);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.selectedIctsi = null;
  }

  confirmDelete(): void {
    if (!this.selectedIctsi) return;

    this.isSubmitting = true;

    // Mock implementation
    setTimeout(() => {
      const index = this.ictsisList.findIndex(r => r.ictsiId === this.selectedIctsi!.ictsiId);
      if (index !== -1) {
        const ictsiName = this.ictsisList[index].ictsiName;
        this.ictsisList.splice(index, 1);
        this.totalItems = this.ictsisList.length;
        this.showSuccess(`Record ${ictsiName} deleted successfully`);
      }
      this.closeDeleteConfirm();
      this.isSubmitting = false;
    }, 1000);
  }

  viewTransactions(ictsi: Ictsi): void {
    this.router.navigate(['/financial/ictsi-management-list/ictsi-transaction-list'], {
      queryParams: { ictsiId: ictsi.ictsiId, guid: ictsi.ictsiGuid }
    });
  }

  getTotalCredits(): number {
    return this.ictsisList
      .filter(r => r.isActive)
      .reduce((sum, ictsi) => sum + ictsi.addedAmount, 0);
  }

  getUsedCredits(): number {
    return this.ictsisList
      .filter(r => r.isActive)
      .reduce((sum, ictsi) => sum + (ictsi.addedAmount - ictsi.currentAmount), 0);
  }

  getRemainingCredits(): number {
    return this.ictsisList
      .filter(r => r.isActive)
      .reduce((sum, ictsi) => sum + ictsi.currentAmount, 0);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (this.currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  getPagedIctsi(): Ictsi[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredIctsi.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredIctsi.length / this.itemsPerPage);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
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
