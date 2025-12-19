import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // Adjust path as needed


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  showPassword = false;
  rememberMe = false;

  // Toast notifications
  showSuccessToast = false;
  showErrorToast = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.checkRememberedUser();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  checkRememberedUser(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
      this.rememberMe = true;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
  if (this.loginForm.invalid) {
    this.markFormGroupTouched(this.loginForm);
    return;
  }

  this.isSubmitting = true;
  const { email, password, rememberMe } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (response) => {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.successMessage = 'Login successful! Redirecting...';
      this.showSuccessToast = true;

      // Hide toast and redirect after 1.5 seconds
      setTimeout(() => {
        this.showSuccessToast = false;
        this.isSubmitting = false;
        
        // Navigate after ensuring auth state is set
        this.router.navigate(['/dashboard']).then(
          () => console.log('Navigation successful'),
          (error) => console.error('Navigation failed:', error)
        );
      }, 1500);
    },
    error: (error) => {
      this.isSubmitting = false;
      this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
      this.showErrorToast = true;

      setTimeout(() => {
        this.showErrorToast = false;
      }, 5000);
    }
  });
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}