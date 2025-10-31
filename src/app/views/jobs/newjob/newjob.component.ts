import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberFormatDirective } from '../../../shared/directives/number-format.directive';
import { JobsService } from '../../../services/jobs/jobs.service';
import { AgencyService } from '../../../services/agency/agency.service';
import { Configuration } from '../../../models/configuration';
import { CustomerAccount } from '../../../models/customer';
import { Agency } from '../../../models/agency';
import { CreateJobRequest } from '../../../models/job-new';

@Component({
  selector: 'app-newjob',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumberFormatDirective],
  templateUrl: './newjob.component.html',
  styleUrls: ['./newjob.component.scss']
})
export class NewjobComponent implements OnInit {

  currentStep = 1;
  isSubmitting = false;

  // Freight type states
  freightTypeLabel = '';
  isAirFreight = false;
  isSeaFreight = false;

  // Configuration lists
  incotermsList: Configuration[] = [];
  jobTransactionTypeList: Configuration[] = [];
  paymenTypeList: Configuration[] = [];
  
  // Client list and search
  clientList: CustomerAccount[] = [];
  filteredClients: CustomerAccount[] = [];
  clientSearch = '';
  clientDropdownOpen = false;

  // Agency list and search
  agencyList: Agency[] = [];
  filteredAgencies: Agency[] = [];
  agencySearch = '';
  agencyDropdownOpen = false;

  // Forms for each step
  jobDetailsForm!: FormGroup;
  shipmentFreightForm!: FormGroup;
  freightForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private jobService: JobsService,
    private agencyService: AgencyService
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadConfigurations();
    this.loadCustomers();
    this.loadAgencies();
  }

  initializeForms(): void {
    // Step 1: Job Details
    this.jobDetailsForm = this.fb.group({
      clientInformation: ['', Validators.required],
      transactionType: ['', Validators.required],
      incoterms: ['', Validators.required],
      paymentType: ['', Validators.required],
      amount: ['', [Validators.required]]
    });

    // Step 2: Common Freight Details
    this.shipmentFreightForm = this.fb.group({
      //shipment schedule
      cutoff: [''],
      etd: [''],
      eta: [''],

      //routing & location
      origin: [''],
      destination: [''],
      portCfs: [''],

      //shipment details
      commodity: [''],
      volume: [''],
      grossWeight: [''],
      numberOfPackages: [''],
    });

    // Step 3: Specific Freight Details (Air/Sea)
    this.freightForm = this.fb.group({
      // Sea-specific
      mbl: [''],
      hbl: [''],
      vessel: [''],
      containerType: [''],
      containerCount: [''],

      // Air-specific
      mawb: [''],
      hawb: [''],
      flightNo: [''],
      chargeableWeight: [''],

      // Shared fields
      bookingNo: [''],
      carrier: [''],
      shipper: [''],
      consignee: [''],
      agent: [''], // This will store agencyId
      remarks: [''],
    });
  }

  loadConfigurations(): void {
    this.jobService.getAllConfiguratios().subscribe({
      next: (response) => {
        if (response.success) {
          this.setIncotermsList(response.data);
          this.setJobTransactionTypeList(response.data);
          this.setPaymentTypeList(response.data);
        } else {
          console.error('API returned error:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading configurations:', error);
      }
    });
  }

  loadCustomers(): void {
    this.jobService.getAllCustomers().subscribe({
      next: (response) => {
        if (response.success && response.data?.length) {
          this.clientList = response.data
            .filter(c => c.isActive)
            .sort((a, b) => a.customerName.localeCompare(b.customerName));
          this.filteredClients = [...this.clientList];
        } else {
          console.error('API returned error:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }
  
loadAgencies(): void {
  this.agencyService.getAllAgencies().subscribe({
    next: (response) => {
      if (response.success && response.data?.length) {
        this.agencyList = response.data
          .filter((a: Agency) => a.isActive)
          .sort((a: Agency, b: Agency) => a.agentName.localeCompare(b.agentName));
        this.filteredAgencies = [...this.agencyList];
      } else {
        console.error('API returned error:', response.message);
      }
    },
    error: (error) => {
      console.error('Error loading agencies:', error);
    }
  });
}

  setIncotermsList(incoterms: Configuration[]): void {
    if (incoterms?.length) {
      this.incotermsList = incoterms
        .filter(term => term.category === 'INCOTERMS' && term.isActive)
        .sort((a, b) => a.value.localeCompare(b.value));
    }
  }

  setJobTransactionTypeList(transactionTypes: Configuration[]): void {
    if (transactionTypes?.length) {
      this.jobTransactionTypeList = transactionTypes
        .filter(type => type.category === 'JOBTRANSACTIONTYPE' && type.isActive)
        .sort((a, b) => a.value.localeCompare(b.value));
    }
  }

  setPaymentTypeList(paymentTypes: Configuration[]): void {
    if (paymentTypes?.length) {
      this.paymenTypeList = paymentTypes
        .filter(type => type.category === 'JOBPAYMENTTYPE' && type.isActive)
        .sort((a, b) => a.value.localeCompare(b.value));
    }
  }

  // Client search and selection
  onClientSearchChange(value: string): void {
    this.clientSearch = value;
    this.filteredClients = this.clientList.filter(c =>
      c.customerName.toLowerCase().includes(value.toLowerCase())
    );
    this.clientDropdownOpen = true;
  }

  selectClient(client: CustomerAccount): void {
    this.jobDetailsForm.patchValue({
      clientInformation: client.customerId
    });
    this.clientSearch = client.customerName;
    this.clientDropdownOpen = false;
  }

  // Agency search and selection
  onAgencySearchChange(value: string): void {
    this.agencySearch = value;
    this.filteredAgencies = this.agencyList.filter(a =>
      a.agentName.toLowerCase().includes(value.toLowerCase())
    );
    this.agencyDropdownOpen = true;
  }

  selectAgency(agency: Agency): void {
    this.freightForm.patchValue({
      agent: agency.agencyId
    });
    this.agencySearch = agency.agentName;
    this.agencyDropdownOpen = false;
  }

  onTransactionTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const freightType = selectElement?.selectedOptions[0]?.getAttribute('data-freight-type') || '';
    this.updateFreightFields(freightType);
  }

  updateFreightFields(value: string): void {
    this.isAirFreight = ['FAE', 'FAI', 'CRA', 'DFA'].includes(value);
    this.isSeaFreight = ['FSE', 'FSI', 'CRS', 'DFS'].includes(value);

    if (this.isAirFreight) {
      this.freightTypeLabel = 'Air Freight';
    } else if (this.isSeaFreight) {
      this.freightTypeLabel = 'Sea Freight';
    } else {
      this.freightTypeLabel = 'Other Type';
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.client-dropdown')) {
      this.clientDropdownOpen = false;
    }
    if (!target.closest('.agency-dropdown')) {
      this.agencyDropdownOpen = false;
    }
  }

  onSubmit(): void {
    // Validate all forms
    if (this.jobDetailsForm.invalid) {
      this.currentStep = 1;
      this.jobDetailsForm.markAllAsTouched();
      return;
    }

    if (this.shipmentFreightForm.invalid) {
      this.currentStep = 2;
      this.shipmentFreightForm.markAllAsTouched();
      return;
    }

    if (this.freightForm.invalid) {
      this.currentStep = 3;
      this.freightForm.markAllAsTouched();
      return;
    }

    const jobRequest: CreateJobRequest = {
      clientInformationId: +this.jobDetailsForm.value.clientInformation,
      transactionTypeId: +this.jobDetailsForm.value.transactionType,
      incotermsId: +this.jobDetailsForm.value.incoterms,
      paymentTypeId: +this.jobDetailsForm.value.paymentType,
      amount: parseFloat(this.jobDetailsForm.value.amount),

      cutoff: this.shipmentFreightForm.value.cutoff || null,
      etd: this.shipmentFreightForm.value.etd || null,
      eta: this.shipmentFreightForm.value.eta || null,
      origin: this.shipmentFreightForm.value.origin || null,
      destination: this.shipmentFreightForm.value.destination || null,
      portCfs: this.shipmentFreightForm.value.portCfs || null,
      commodity: this.shipmentFreightForm.value.commodity || null,
      volume: this.shipmentFreightForm.value.volume ? +this.shipmentFreightForm.value.volume : null,
      grossWeight: this.shipmentFreightForm.value.grossWeight ? +this.shipmentFreightForm.value.grossWeight : null,
      numberOfPackages: this.shipmentFreightForm.value.numberOfPackages ? +this.shipmentFreightForm.value.numberOfPackages : null,

      mbl: this.freightForm.value.mbl || null,
      hbl: this.freightForm.value.hbl || null,
      vessel: this.freightForm.value.vessel || null,
      containerType: this.freightForm.value.containerType || null,
      containerCount: this.freightForm.value.containerCount ? +this.freightForm.value.containerCount : null,
      mawb: this.freightForm.value.mawb || null,
      hawb: this.freightForm.value.hawb || null,
      flightNo: this.freightForm.value.flightNo || null,
      chargeableWeight: this.freightForm.value.chargeableWeight ? +this.freightForm.value.chargeableWeight : null,
      bookingNo: this.freightForm.value.bookingNo || null,
      carrier: this.freightForm.value.carrier || null,
      shipper: this.freightForm.value.shipper || null,
      consignee: this.freightForm.value.consignee || null,
      agent: this.freightForm.value.agent || null,
      remarks: this.freightForm.value.remarks || null,
    };

    this.isSubmitting = true;

    this.jobService.createJob(jobRequest).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Job created successfully:', response.data);
          alert('Job created successfully!');
          // Reset forms or navigate away
          this.resetForms();
        } else {
          console.error('API returned error:', response.message);
          alert(`Error: ${response.message}`);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('API call failed:', error);
        alert('Failed to create job. Please try again.');
        this.isSubmitting = false;
      }
    });
    
  }

  validateAmountInput(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const input = (event.target as HTMLInputElement).value;
    
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9.]$/.test(event.key)) event.preventDefault();
    if (event.key === '.' && input.includes('.')) event.preventDefault();
    
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length >= 2 && event.key !== 'Backspace') {
      event.preventDefault();
    }
  }

  goToStep(s: number): void {
    if (s === 2 && this.jobDetailsForm.invalid) {
      this.jobDetailsForm.markAllAsTouched();
      return;
    }

    if (s === 3 && this.shipmentFreightForm.invalid) {
      this.shipmentFreightForm.markAllAsTouched();
      return;
    }

    this.currentStep = s;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.jobDetailsForm.invalid) {
        this.jobDetailsForm.markAllAsTouched();
        return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (this.shipmentFreightForm.invalid) {
        this.shipmentFreightForm.markAllAsTouched();
        return;
      }
      this.currentStep = 3;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  finish(): void {
    this.onSubmit();
  }

  resetForms(): void {
    this.jobDetailsForm.reset();
    this.shipmentFreightForm.reset();
    this.freightForm.reset();
    this.clientSearch = '';
    this.filteredClients = [...this.clientList];
    this.agencyList = [...this.agencyList];
    this.agencySearch = '';
    this.currentStep = 1;
  }
}