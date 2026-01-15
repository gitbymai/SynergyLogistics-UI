import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerAccount, NewCustomerAccount, UpdateCustomerAccount } from '../../../models/customer';
import { finalize } from 'rxjs/operators';
import { CustomerManagementService } from '../../../services/admin/customermanagement.service';
import { Configuration } from '../../../models/configuration';

@Component({
  selector: 'app-manage-clients',
  templateUrl: './manage-clients.component.html',
  styleUrl: './manage-clients.component.scss',
  imports: [CommonModule, ReactiveFormsModule]
})
export class ManageClientsComponent implements OnInit {

  customerForm!: FormGroup;
  customerList: CustomerAccount[] = [];
  filterCustomers: CustomerAccount[] = [];

  // Modals
  showModal = false;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;

  // search
  searchTerm = '';
  selectedStatus = '';

  // for edit / delete
  selectedCustomer: CustomerAccount | null = null;

  // Toast Notifications
  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  
  clientType: Configuration[] = [];
  clientIndustry: Configuration[] = [];

  constructor(private fb: FormBuilder, private customerService: CustomerManagementService) {

  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadConfigurations();
    this.initializeForm();
  }

  initializeForm(): void {
    this.customerForm = this.fb.group({

      customerName: ['', [Validators.required, Validators.maxLength(100)]],
      mainAddress: ['', [Validators.required, Validators.maxLength(900)]],
      state: ['', [Validators.maxLength(50)]],
      city: ['', [Validators.maxLength(50)]],
      contactPerson: ['', [Validators.maxLength(100)]],
      contactNumber: ['', [Validators.maxLength(20)]],
      emailAddress: ['', [Validators.email, Validators.maxLength(50)]],
      taxIdentificationNumber: ['', [Validators.maxLength(90)]],
      optionClientCategoryId: ['0'],
      optionIndustryId: ['0'],
    });
  }

  
  loadConfigurations(): void {
    this.customerService.getAllConfigurations().subscribe({
      next: (response) => {
        if (response.success) {
          this.setClientType(response.data);
          this.setClientIndustry(response.data);
        } else {
          console.error('API returned error:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading configurations:', error);
      }
    });
  }

    setClientType(clientType: Configuration[]): void {
      if (clientType?.length) {
        this.clientType = clientType
          .filter(term => term.category === 'CLIENTTYPE' && term.isActive)
          .sort((a, b) => a.value.localeCompare(b.value));
      }
    }
  
    setClientIndustry(clientIndustry: Configuration[]): void {
      if (clientIndustry?.length) {
        this.clientIndustry = clientIndustry
          .filter(term => term.category === 'INDUSTRY' && term.isActive)
          .sort((a, b) => a.value.localeCompare(b.value));
      }
    }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getAllCustomers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (customers) => {

          if (customers.success && customers.data) {
            this.customerList = customers.data.sort((a, b) => a.customerName.localeCompare(b.customerName));
            this.totalItems = this.customerList.length;
            this.applyFilters();

          } else {
            this.showError(customers.message || 'Failed to load customers');
          }
        },
        error: (error) => {
          console.error('Error loading customers:', error);
          this.showError('Failed to load customers. Please try again.');
        }
      });
  }

  applyFilters(): void {
    this.filterCustomers = this.customerList.filter(customer => {

      const matchSearch =
        customer.customerName.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.selectedStatus ||
        (this.selectedStatus === 'active' && customer.isActive) ||
        (this.selectedStatus === 'inactive' && !customer.isActive);

      return matchSearch && matchStatus;

    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  openNewCustomerModal(): void {
    this.isEditMode = false;
    this.selectedCustomer = null;
    this.customerForm.reset();
    this.customerForm.updateValueAndValidity();
    this.showModal = true;
  }

  editCustomer(customer: CustomerAccount): void {
    this.isEditMode = true;
    this.selectedCustomer = customer;

    this.customerForm.patchValue({
      customerName: customer.customerName,
      mainAddress: customer.mainAddress,
      state: customer.state,
      city: customer.city,
      contactPerson: customer.contactPerson,
      contactNumber: customer.contactNumber,
      emailAddress: customer.emailAddress,
      taxIdentificationNumber: customer.taxIdentificationNumber,
      optionClientCategoryId: customer.optionClientCategoryId,
      optionIndustryId: customer.optionIndustryId,
    });

    this.showModal = true;
  }

  closeCustomerModal(): void {
    this.showModal = false;
    this.customerForm.reset();
    this.selectedCustomer = null;
    this.isEditMode = false;
  }

  submitCustomerForm(): void {
    if (!this.customerForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedCustomer) {
      this.updateCustomer();
    } else {
      this.createCustomer();
    }
  }

  createCustomer(): void {
    const createRequest: NewCustomerAccount = {
      customerName: this.customerForm.value.customerName,
      mainAddress: this.customerForm.value.mainAddress,
      city: this.customerForm.value.city,
      state: this.customerForm.value.state,
      contactPerson: this.customerForm.value.contactPerson,
      emailAddress: this.customerForm.value.email,
      contactNumber: this.customerForm.value.phone,
      taxIdentificationNumber: this.customerForm.value.taxIdentificationNumber,
      optionClientCategoryId: this.customerForm.value.optionClientCategoryId ?? 0,
      optionIndustryId: this.customerForm.value.optionIndustryId ?? 0,
    };

    this.customerService.createCustomer(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.customerList.push(response.data);
            this.customerList.sort((a, b) =>
              a.customerName.localeCompare(b.customerName)
            );
            this.totalItems = this.customerList.length;
            this.applyFilters();
            this.showSuccess(`Customer ${response.data.customerName} created successfully`);
            this.closeCustomerModal();

          } else {
            this.showError(response.message || 'Failed to create customer');
          }
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.showError(error?.error?.message || 'Failed to create customer');
        }
      });
  }

  updateCustomer(): void {
    if (!this.selectedCustomer) return;

    const updateRequest: UpdateCustomerAccount = {
      customerName: this.customerForm.value.customerName,
      mainAddress: this.customerForm.value.mainAddress,
      city: this.customerForm.value.city,
      state: this.customerForm.value.state,
      contactPerson: this.customerForm.value.contactPerson,
      emailAddress: this.customerForm.value.email,
      contactNumber: this.customerForm.value.phone,
      taxIdentificationNumber: this.customerForm.value.taxIdentificationNumber,
      optionClientCategoryId: this.customerForm.value.optionClientCategoryId ?? 0,
      optionIndustryId: this.customerForm.value.optionIndustryId ?? 0,
      customerGuid: this.selectedCustomer.customerGuid,
    };

    this.customerService.updateCustomer(updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.customerList.findIndex(c => c.customerId === this.selectedCustomer!.customerId);
            if (index !== -1) {
              this.customerList[index] = response.data;
              this.applyFilters();
            }
            this.showSuccess(`Customer ${response.data.customerName} updated successfully`);
            this.closeCustomerModal();
          } else {
            this.showError(response.message || 'Failed to update customer');
          }
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.showError(error?.error?.message || 'Failed to update customer');
        }
      });
  }

  toggleClientStatus(customer: CustomerAccount): void {
    this.customerService.toggleUserStatus(customer.customerGuid, !customer.isActive)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {

            const index = this.customerList.findIndex(u => u.customerId === customer.customerId);
            if (index !== -1) {
              this.customerList[index].isActive = !customer.isActive;
              this.applyFilters();
              this.showSuccess(response.message || 'Client status updated successfully');
            }
          } else {
            this.showError(response.message || 'Failed to update client status');
          }
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.showError(error?.error?.message || 'Failed to update user status');
        }
      });
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  getPagedCustomers(): CustomerAccount[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filterCustomers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filterCustomers.length / this.itemsPerPage);
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