import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgencyService} from '../../../services/agency/agency.service';
import { Agency, NewAgency, UpdateAgency } from '../../../models/agency';

@Component({
  selector: 'app-agency-management',
  templateUrl: './agency-management.component.html'
})
export class AgencyManagementComponent implements OnInit {
  agencies: Agency[] = [];
  agencyForm!: FormGroup;
  isLoading = false;
  isEditing = false;
  editingAgencyGuid: string | null = null;

  constructor(
    private agencyService: AgencyService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadAgencies();
  }

  initializeForm(): void {
    this.agencyForm = this.fb.group({
      agentName: ['', [Validators.required, Validators.maxLength(200)]],
      contactPerson: ['', [Validators.required, Validators.maxLength(200)]],
      address: ['', Validators.maxLength(1000)],
      contactNumber: ['', Validators.maxLength(20)],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(50)]]
    });
  }

  loadAgencies(): void {
    this.isLoading = true;
    this.agencyService.getAllAgencies().subscribe({
      next: (response) => {
        if (response.Success) {
          this.agencies = response.Data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading agencies:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.agencyForm.invalid) {
      this.agencyForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.editingAgencyGuid) {
      // Update existing agency
      const updateAgency: UpdateAgency = {
        agencyGuid: this.editingAgencyGuid,
        contactPerson: this.agencyForm.value.contactPerson,
        address: this.agencyForm.value.address,
        contactNumber: this.agencyForm.value.contactNumber,
        emailAddress: this.agencyForm.value.emailAddress
      };

      this.agencyService.updateAgency(this.editingAgencyGuid, updateAgency).subscribe({
        next: (response) => {
          if (response.Success) {
            alert('Agency updated successfully!');
            this.resetForm();
            this.loadAgencies();
          } else {
            alert(`Error: ${response.Message}`);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating agency:', error);
          alert('Failed to update agency. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      // Create new agency
      const newAgency: NewAgency = this.agencyForm.value;

      this.agencyService.createAgency(newAgency).subscribe({
        next: (response) => {
          if (response.Success) {
            alert('Agency created successfully!');
            this.resetForm();
            this.loadAgencies();
          } else {
            alert(`Error: ${response.Message}`);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating agency:', error);
          alert('Failed to create agency. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

  editAgency(agency: Agency): void {
    this.isEditing = true;
    this.editingAgencyGuid = agency.agencyGuid;
    
    this.agencyForm.patchValue({
      agentName: agency.agentName,
      contactPerson: agency.contactPerson,
      address: agency.address,
      contactNumber: agency.contactNumber,
      emailAddress: agency.emailAddress
    });

    // Disable agentName when editing (it's not in UpdateAgencyPartnerDTO)
    this.agencyForm.get('agentName')?.disable();
  }

  deleteAgency(agency: Agency): void {
    if (!confirm(`Are you sure you want to delete ${agency.agentName}?`)) {
      return;
    }

    this.agencyService.deleteAgency(agency.agencyGuid).subscribe({
      next: (response) => {
        if (response.Success) {
          alert('Agency deleted successfully!');
          this.loadAgencies();
        } else {
          alert(`Error: ${response.Message}`);
        }
      },
      error: (error) => {
        console.error('Error deleting agency:', error);
        alert('Failed to delete agency. Please try again.');
      }
    });
  }

  activateAgency(agency: Agency): void {
    this.agencyService.activateAgency(agency.agencyGuid).subscribe({
      next: (response) => {
        if (response.Success) {
          alert('Agency activated successfully!');
          this.loadAgencies();
        } else {
          alert(`Error: ${response.Message}`);
        }
      },
      error: (error) => {
        console.error('Error activating agency:', error);
        alert('Failed to activate agency. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.agencyForm.reset();
    this.agencyForm.get('agentName')?.enable();
    this.isEditing = false;
    this.editingAgencyGuid = null;
  }
}