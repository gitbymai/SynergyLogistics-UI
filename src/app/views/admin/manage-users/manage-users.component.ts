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

  isResettingPassword = false;
  resetPasswordSuccess = false;

  constructor(private fb: FormBuilder, private userManagementService: UsermanagementService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  initializeForm(): void {
    this.userForm = this.fb.group({
      accountName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      department: ['', Validators.maxLength(100)],
      roleId: ['', Validators.required],
      isActive: [true],
      accountLocked: [false]
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userManagementService.getAllUsers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {

          if (response.success && response.data) {
            this.userList = response.data.sort((a, b) =>
              a.accountName.localeCompare(b.accountName)
            );
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

      const matchRole = !this.selectedRole || user.role.toString() === this.selectedRole;
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
    this.userForm.updateValueAndValidity();
    this.showUserModal = true;
  }

  editUser(user: Account): void {
    this.isEditMode = true;
    this.selectedUser = user;

    const roleId = user.role || 0;

    this.userForm.patchValue({
      accountName: user.accountName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      roleId: roleId,
    });

    this.showUserModal = true;
  }

  forceResetPassword(): void {
    if (!this.selectedUser) {
      return;
    }

    this.isResettingPassword = true;
    this.resetPasswordSuccess = false;

    this.userManagementService.forcePasswordReset(this.selectedUser.accountGuid).subscribe({
      next: (response) => {
        this.isResettingPassword = false;
        if (response.success) {
          this.resetPasswordSuccess = true;
          this.showSuccess('Password reset successfully');
        } else {
          this.showError(response.message || 'Failed to reset password');
        }
      },
      error: (error) => {
        this.isResettingPassword = false;
        this.resetPasswordSuccess = false;
        const errorMessage = error.error?.message || 'An error occurred while resetting password';
        this.showError(errorMessage);
        console.error('Reset password error:', error);
      }
    });
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.userForm.reset();
    this.selectedUser = null;
    this.isEditMode = false;
    this.resetPasswordSuccess = false;
    this.isResettingPassword = false;
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

  createUser(): void {
    const createRequest: CreateAccountRequest = {
      accountName: this.userForm.value.accountName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      department: this.userForm.value.department,
      roleId: this.userForm.value.roleId
    };

    this.userManagementService.createUser(createRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.userList.push(response.data);
            this.userList.sort((a, b) =>
              a.accountName.localeCompare(b.accountName)
            );
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

  updateUser(): void {
    if (!this.selectedUser) return;

    const updateRequest: UpdateAccountRequest = {
      accountGuid: this.selectedUser.accountGuid,
      accountName: this.userForm.value.accountName,
      email: this.userForm.value.email,
      phone: this.userForm.value.phone,
      department: this.userForm.value.department,
      roleId: this.userForm.value.roleId,
      isActive: Boolean(this.userForm.value.isActive)
    };

    this.userManagementService.updateUser(updateRequest)
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

  toggleUserStatus(user: Account): void {
    this.userManagementService.toggleUserStatus(user.accountGuid, !user.isActive)
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