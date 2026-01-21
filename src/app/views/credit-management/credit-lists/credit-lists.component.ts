import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Resource,
  NewResource,
  UpdateResource,
} from '../../../models/resource';
import { ResourceService } from '../../../services/resource/resource.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-credit-lists',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './credit-lists.component.html',
  styleUrl: './credit-lists.component.scss',
})
export class CreditListsComponent implements OnInit {
  resourceForm!: FormGroup;
  resourcesList: Resource[] = [];
  filteredResources: Resource[] = [];

  showResourceModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;

  // Selected Resource for edit/delete
  selectedResource: Resource | null = null;

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
    private resourceService: ResourceService,
    private router: Router) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadRecords();
  }

  initializeForm(): void {
    this.resourceForm = this.fb.group({
      resourceName: ['', [Validators.required, Validators.maxLength(100)]],
      optionResourceTypeId: [0],
      addedAmount: ['', [Validators.required, Validators.min(0), Validators.max(9999999999999999.99)]],
      currentAmount: ['', [Validators.required, Validators.min(0), Validators.max(9999999999999999.99)]],
      isActive: [true]
    });
  }

  loadRecords(): void {
    this.isLoading = true;

    this.resourceService.getAllResources().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.resourcesList = response.data;
          this.filteredResources = [...this.resourcesList];
          this.totalItems = this.resourcesList.length;
        } else {
          this.showError(response.message || 'Failed to load resources');
        }
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.showError('Failed to load resources. Please try again.');
      }
    });


    setTimeout(() => {
      this.isLoading = false;
      this.totalItems = this.resourcesList.length;
    }, 500);
  }

  openNewResourceModal(): void {
    this.isEditMode = false;
    this.selectedResource = null;
    this.resourceForm.reset({ isActive: true });
    this.resourceForm.get('addedAmount')?.enable();
    this.showResourceModal = true;
  }

  editResource(resource: Resource): void {
    this.isEditMode = true;
    this.selectedResource = resource;

    this.resourceForm.patchValue({
      resourceName: resource.resourceName,
      optionResourceTypeId: resource.optionResourceTypeId,
      addedAmount: resource.addedAmount,
      currentAmount: resource.currentAmount,
      isActive: resource.isActive
    });

    // Disable addedAmount in edit mode
    this.resourceForm.get('addedAmount')?.disable();
    this.showResourceModal = true;
  }

  closeResourceModal(): void {
    this.showResourceModal = false;
    this.resourceForm.reset();
    this.selectedResource = null;
    this.isEditMode = false;
    this.resourceForm.get('addedAmount')?.enable();
  }

  submitResourceForm(): void {
    if (!this.resourceForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedResource) {
      this.updateResource();
    } else {
      this.createResource();
    }
  }

  createResource(): void {
    const createRequest: NewResource = {
      resourceName: this.resourceForm.value.resourceName,
      optionResourceTypeId: 1,
      addedAmount: this.resourceForm.value.addedAmount,
      currentAmount: this.resourceForm.value.currentAmount
    };

    this.resourceService.createResource(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.resourcesList.push(response.data);
            this.totalItems = this.resourcesList.length;
          this.filteredResources = [...this.resourcesList];
          this.totalItems = this.resourcesList.length;

            this.showSuccess(`Record ${response.data.resourceName} created successfully`);

            this.closeResourceModal();
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

  updateResource(): void {
    if (!this.selectedResource) return;

    const updateRequest: UpdateResource = {
      resourceId: this.selectedResource.resourceId,
      resourceGuid: this.selectedResource.resourceGuid,
      resourceName: this.resourceForm.value.resourceName,
      currentAmount: this.resourceForm.value.currentAmount,
      isActive: this.resourceForm.value.isActive
    };

    this.resourceService.updateResource(updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.resourcesList.findIndex(r => r.resourceId === this.selectedResource!.resourceId);
            if (index !== -1) {
              this.resourcesList[index] = response.data;
            }
            this.showSuccess(`Resource ${response.data.resourceName} updated successfully`);
            this.closeResourceModal();
          } else {
            this.showError(response.message || 'Failed to update resource');
          }
        },
        error: (error) => {
          console.error('Error updating resource:', error);
          this.showError(error?.error?.message || 'Failed to update resource');
        }
      });
  }

  deleteResource(resource: Resource): void {
    this.openDeleteConfirm(resource);
  }

  openDeleteConfirm(resource: Resource): void {
    this.selectedResource = resource;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.selectedResource = null;
  }

  confirmDelete(): void {
    if (!this.selectedResource) return;

    this.isSubmitting = true;

    // Mock implementation
    setTimeout(() => {
      const index = this.resourcesList.findIndex(r => r.resourceId === this.selectedResource!.resourceId);
      if (index !== -1) {
        const resourceName = this.resourcesList[index].resourceName;
        this.resourcesList.splice(index, 1);
        this.totalItems = this.resourcesList.length;
        this.showSuccess(`Resource ${resourceName} deleted successfully`);
      }
      this.closeDeleteConfirm();
      this.isSubmitting = false;
    }, 1000);
  }

  viewTransactions(resource: Resource): void {
    this.router.navigate(['/financial/credit-management-list/credit-transaction-list'], {
      queryParams: { resourceId: resource.resourceId, guid: resource.resourceGuid }
    });
  }

  // Summary Calculations
  getTotalCredits(): number {
    return this.resourcesList
      .filter(r => r.isActive)
      .reduce((sum, resource) => sum + resource.addedAmount, 0);
  }

  getUsedCredits(): number {
    return this.resourcesList
      .filter(r => r.isActive)
      .reduce((sum, resource) => sum + (resource.addedAmount - resource.currentAmount), 0);
  }

  getRemainingCredits(): number {
    return this.resourcesList
      .filter(r => r.isActive)
      .reduce((sum, resource) => sum + resource.currentAmount, 0);
  }

  // Pagination Methods - Following the Users table pattern
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

  getPagedResources(): Resource[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredResources.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredResources.length / this.itemsPerPage);
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

  // Toast Notifications
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