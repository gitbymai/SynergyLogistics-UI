import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberFormatDirective } from '../../../shared/directives/number-format.directive';
import { JobsService } from '../../../services/jobs/jobs.service';
import { Configuration } from '../../../models/configuration';
import { CustomerAccount } from '../../../models/customer';
import {CreateJobRequest } from '../../../models/job-new';
import { initial } from 'lodash-es';


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

  incotermsList: Configuration[] = [];
  jobTransactionTypeList: Configuration[] = [];
  paymenTypeList: Configuration[] = [];
  clientList: CustomerAccount[] = [];

  filteredClients = [...this.clientList];
  clientSearch = '';
  dropdownOpen = false;

  // Forms for each step
  jobDetailsForm!: FormGroup;
  shipmentFreightForm!: FormGroup;
  freightForm!: FormGroup;

  constructor(private fb: FormBuilder, private jobService: JobsService) { }

  ngOnInit(): void {

    this.initializeForms();

    // API Call
    this.jobService.getAllConfiguratios().subscribe({
      next: (response) => {
        if (response.success) {
          this.setIncotermsList(response.data);
          this.setJobTransactionTypeList(response.data);
          this.setPaymentTypeList(response.data);
        } else {
          console.error('API returned error:', response.message);
        }
      }
    });

    this.jobService.getAllCustomers().subscribe({
      next: (response) => {
        if (response.success) {
          if (response.data && response.data.length) {
            this.clientList = response.data.sort((a, b) => a.customerName.localeCompare(b.customerName)).filter(c => c.isActive);
            this.filteredClients = [...this.clientList];
          }
        } else {
          console.error('API returned error:', response.message);
        }
      }
    });
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
      agent: [''],
      remarks: [''],
    });

  }

  onSubmit(): void {
    if(this.jobDetailsForm.invalid){
 
      this.currentStep = 1;
      this.jobDetailsForm.markAllAsTouched();
      return;

    }

    if(this.shipmentFreightForm.invalid){

      this.currentStep = 2;
      this.shipmentFreightForm.markAllAsTouched();
      return;
    }

    if(this.freightForm.invalid){

      this.currentStep = 3;
      this.freightForm.markAllAsTouched();
      return;
    }
    
    const jobRequest: CreateJobRequest = {
      clientInformationId: this.jobDetailsForm.value.clientInformation,
      transactionTypeId: this.jobDetailsForm.value.transactionType,
      incotermsId: this.jobDetailsForm.value.incoterms,
      paymentTypeId: this.jobDetailsForm.value.paymentType,
      amount: parseFloat(this.jobDetailsForm.value.amount),

      cutoff: this.shipmentFreightForm.value.cutoff,
      etd: this.shipmentFreightForm.value.etd,
      eta: this.shipmentFreightForm.value.eta,
      origin: this.shipmentFreightForm.value.origin,
      destination: this.shipmentFreightForm.value.destination,
      portCfs: this.shipmentFreightForm.value.portCfs,
      commodity: this.shipmentFreightForm.value.commodity,
      volume: this.shipmentFreightForm.value.volume,
      grossWeight: this.shipmentFreightForm.value.grossWeight,
      numberOfPackages: this.shipmentFreightForm.value.numberOfPackages,
      mbl: this.freightForm.value.mbl,
      hbl: this.freightForm.value.hbl,
      vessel: this.freightForm.value.vessel,
      containerType: this.freightForm.value.containerType,
      containerCount: this.freightForm.value.containerCount,
      mawb: this.freightForm.value.mawb,
      hawb: this.freightForm.value.hawb,
      flightNo: this.freightForm.value.flightNo,
      chargeableWeight: this.freightForm.value.chargeableWeight,
      bookingNo: this.freightForm.value.bookingNo,
      carrier: this.freightForm.value.carrier,
      shipper: this.freightForm.value.shipper,
      consignee: this.freightForm.value.consignee,
      agent: this.freightForm.value.agent,
      remarks: this.freightForm.value.remarks,

    };

    this.isSubmitting = true;

    this.jobService.createJob(jobRequest).subscribe({
      next: (response) => {
        if(response.success){
          console.log('Job created successfully:', response.data);
        }
        else{
          console.error('API returned error:', response.message); 
        }

        this.isSubmitting= false;
      },
      error: (error) => {
        console.error('API call failed:', error);
        this.isSubmitting= false;
      }
    });
  }

  setIncotermsList(incoterms: Configuration[]) {
    if (incoterms && incoterms.length) {
      this.incotermsList = incoterms.filter(term => term.category === 'INCOTERMS' && term.isActive);

      if (this.incotermsList.length) {
        this.incotermsList = this.incotermsList.sort((a, b) => a.value.localeCompare(b.value));
      }
    }
  }

  setJobTransactionTypeList(transactionTypes: Configuration[]) {
    if (transactionTypes && transactionTypes.length) {
      this.jobTransactionTypeList = transactionTypes.filter(type => type.category === 'JOBTRANSACTIONTYPE' && type.isActive);

      if (this.jobTransactionTypeList.length) {
        this.jobTransactionTypeList = this.jobTransactionTypeList.sort((a, b) => a.value.localeCompare(b.value));
      }
    }
  }

  setPaymentTypeList(paymentTypes: Configuration[]) {
    if (paymentTypes && paymentTypes.length) {
      this.paymenTypeList = paymentTypes.filter(type => type.category === 'PAYMENTTYPE' && type.isActive);
      if (this.paymenTypeList.length) {
        this.paymenTypeList = this.paymenTypeList.sort((a, b) => a.value.localeCompare(b.value));
      }
    }
  }

  onClientSearchChange(value: string) {
    this.clientSearch = value;
    this.filteredClients = this.clientList.filter(c =>
      c.customerName.toLowerCase().includes(value.toLowerCase())
    );

    this.dropdownOpen = true;
  }

  selectClient(client: any) {
    this.jobDetailsForm.patchValue({
      clientInformation: client.customerId
    });

    this.clientSearch = client.customerName;
    this.dropdownOpen = false;

  }

  onTransactionTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement?.value || '';
    const freightType = selectElement?.selectedOptions[0]?.getAttribute('data-freight-type') || '';

    this.updateFreightFields(freightType);

  }

  updateFreightFields(value: string) {
    this.isAirFreight = ['FAE', 'FAI', 'CRA', 'DFA'].includes(value);
    this.isSeaFreight = ['FSE', 'FSI', 'CRS', 'DFS'].includes(value);

    if (this.isAirFreight)
      this.freightTypeLabel = 'Air Freight';

    else if (this.isSeaFreight)
      this.freightTypeLabel = 'Sea Freight';

    else this.freightTypeLabel = 'Other Type';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.client-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  validateAmountInput(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    const input = (event.target as HTMLInputElement).value;
    if (allowedKeys.includes(event.key)) return;
    if (!/^[0-9.]$/.test(event.key)) event.preventDefault();
    if (event.key === '.' && input.includes('.')) event.preventDefault();
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length >= 2 && event.key !== 'Backspace') event.preventDefault();
  }

  goToStep(s: number) {
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

  nextStep() {
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
    } else if (this.currentStep === 3) {
      if (this.freightForm.invalid) {
        this.freightForm.markAllAsTouched();
        return;
      }
      this.finish();
    }
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  finish() {
    console.log('Job Details:', this.jobDetailsForm.value);
    console.log('Common Freight Details:', this.shipmentFreightForm.value);
    console.log('Freight Details:', this.freightForm.value);
    alert('Job successfully created!');
  }
}
