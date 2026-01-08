import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import {
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  FormControlDirective,
  FormLabelDirective,
  ButtonDirective,
  AlertComponent
} from '@coreui/angular';
import { UsermanagementService } from '../../../services/admin/usermanagement.service';

@Component({
  selector: 'app-changepassword',
  imports: [CommonModule,
    ReactiveFormsModule,
    IconDirective,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    FormControlDirective,
    FormLabelDirective,
    ButtonDirective,
    AlertComponent],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.scss',
})
export class ChangepasswordComponent implements OnInit {
  passwordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

    constructor(
    private fb: FormBuilder,
    private router: Router,
    private accountService: UsermanagementService
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {

  }

   passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

submitPasswordChange(): void {
  if (this.passwordForm.valid) {
    this.isSubmitting = true;
    
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    this.accountService.changeUserPassword(
      currentPassword,
      newPassword,
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showToastMessage('Password changed successfully!', 'success');
          this.passwordForm.reset();
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        } else {
          this.showToastMessage(response.message || 'Failed to change password', 'error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        let errorMessage = 'An error occurred while changing password';

        this.showToastMessage(errorMessage, 'error');
        console.error('Password change error:', error);
      }
    });
  } else {
    Object.keys(this.passwordForm.controls).forEach(key => {
      this.passwordForm.get(key)?.markAsTouched();
    });
    
    this.showToastMessage('Please fill in all required fields correctly', 'error');
  }
}

  resetForm(): void {
    this.passwordForm.reset();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

}
