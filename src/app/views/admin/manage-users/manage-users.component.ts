import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '../../../models/user';
import { Role } from '../../../models/role';
import { finalize } from 'rxjs/operators';
import { UsermanagementService } from '../../../services/admin/usermanagement.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ManageUsersComponent implements OnInit {
  userForm!: FormGroup;
  userList: Account[] = [];
  filteredUsers: Account[] = [];
  rolesList: Role[] = [];

  // Modal States
  showUserModal = false;
  showDeleteConfirmModal = false;
  isEditMode = false;
  isSubmitting = false;
  isLoading = false;

  // Search & Filter
  searchTerm = '';
  selectedRole = '';
  selectedStatus = '';

  // Selected User for edit/delete
  selectedUser: Account | null = null;

  // Toast Notifications
  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(private fb: FormBuilder, private userManagementService: UsermanagementService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      accountCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      accountName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      department: ['', Validators.maxLength(100)],
      roleId: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      isActive: [true],
      accountLocked: [false]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.getAllUsers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userList = response.data;
            this.totalItems = this.userList.length;
            this.applyFilters();
          } else {
            this.showError(response.message || 'Failed to load users');
          }
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.showError('Failed to load users. Please try again.');
        }
      });
  }

  loadRoles(): void {

    this.userManagementService.getAllRoles()
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.rolesList = response.data;
          } else {
            console.warn('Failed to load roles:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading roles:', error);
        }
      });

  }

  applyFilters(): void {
    this.filteredUsers = this.userList.filter(user => {
      const matchSearch =
        user.accountName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.accountCode.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchRole = !this.selectedRole || user.roleId.toString() === this.selectedRole;
      const matchStatus = !this.selectedStatus ||
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive) ||
        (this.selectedStatus === 'locked' && user.accountLocked);

      return matchSearch && matchRole && matchStatus;
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onRoleChange(value: string): void {
    this.selectedRole = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  openNewUserModal(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset({ isActive: true, accountLocked: false });
    this.userForm.get('password')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.updateValueAndValidity();
    this.showUserModal = true;
  }

  editUser(user: Account): void {
    this.isEditMode = true;
    this.selectedUser = user;

    const roleId = user.roleId?.toString() || '';

    this.userForm.patchValue({
      accountCode: user.accountCode,
      accountName: user.accountName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      roleId: roleId,
      isActive: user.isActive,
      accountLocked: user.accountLocked
    });

    // Password fields optional in edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.userForm.reset();
  }

  submitUserForm(): void {
    if (!this.userForm.valid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  /**
   * Create new user via API
   */
  private createUser(): void {
    const createRequest: CreateAccountRequest = {
      accountCode: this.userForm.value.accountCode,
      accountName: this.userForm.value.accountName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      department: this.userForm.value.department,
      roleId: parseInt(this.userForm.value.roleId),
      password: this.userForm.value.password
    };

    this.userManagementService.createUser(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userList.push(response.data);
            this.totalItems = this.userList.length;
            this.applyFilters();
            this.showSuccess(`User ${response.data.accountName} created successfully`);
            this.closeUserModal();
          } else {
            this.showError(response.message || 'Failed to create user');
          }
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.showError(error?.error?.message || 'Failed to create user');
        }
      });
  }

  /**
   * Update existing user via API
   */
  private updateUser(): void {
    if (!this.selectedUser) return;

    const updateRequest: UpdateAccountRequest = {
      accountName: this.userForm.value.accountName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      department: this.userForm.value.department,
      roleId: parseInt(this.userForm.value.roleId),
      isActive: this.userForm.value.isActive
    };

    this.userManagementService.updateUser(this.selectedUser.accountId, updateRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.userList.findIndex(u => u.accountId === this.selectedUser!.accountId);
            if (index !== -1) {
              this.userList[index] = response.data;
              this.applyFilters();
            }
            this.showSuccess(`User ${response.data.accountName} updated successfully`);
            this.closeUserModal();
          } else {
            this.showError(response.message || 'Failed to update user');
          }
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.showError(error?.error?.message || 'Failed to update user');
        }
      });
  }

  openDeleteConfirm(user: Account): void {
    this.selectedUser = user;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirmModal = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;

    this.isSubmitting = true;

    this.userManagementService.deleteUser(this.selectedUser.accountId)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            const index = this.userList.findIndex(u => u.accountId === this.selectedUser!.accountId);
            if (index !== -1) {
              const userName = this.userList[index].accountName;
              this.userList.splice(index, 1);
              this.totalItems = this.userList.length;
              this.applyFilters();
              this.showSuccess(`User ${userName} deleted successfully`);
            }
            this.closeDeleteConfirm();
          } else {
            this.showError(response.message || 'Failed to delete user');
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showError(error?.error?.message || 'Failed to delete user');
        }
      });
  }

  /**
   * Toggle user active status via API
   */
  toggleUserStatus(user: Account): void {
    this.userManagementService.toggleUserStatus(user.accountId, !user.isActive)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.userList.findIndex(u => u.accountId === user.accountId);
            if (index !== -1) {
              this.userList[index] = response.data;
              this.applyFilters();
              const status = response.data.isActive ? 'activated' : 'deactivated';
              this.showSuccess(`User ${user.accountName} ${status} successfully`);
            }
          } else {
            this.showError(response.message || 'Failed to update user status');
          }
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.showError(error?.error?.message || 'Failed to update user status');
        }
      });
  }

  /**
   * Unlock user account via API
   */
  unlockUser(user: Account): void {
    this.userManagementService.unlockUser(user.accountId)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const index = this.userList.findIndex(u => u.accountId === user.accountId);
            if (index !== -1) {
              this.userList[index] = response.data;
              this.applyFilters();
              this.showSuccess(`User ${user.accountName} unlocked successfully`);
            }
          } else {
            this.showError(response.message || 'Failed to unlock user');
          }
        },
        error: (error) => {
          console.error('Error unlocking user:', error);
          this.showError(error?.error?.message || 'Failed to unlock user');
        }
      });
  }

  getRoleName(roleId: number): string {
    return this.rolesList.find(r => r.roleId === roleId)?.roleName || 'Unknown';
  }
  getPageNumbers(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }
  getPagedUsers(): Account[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
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