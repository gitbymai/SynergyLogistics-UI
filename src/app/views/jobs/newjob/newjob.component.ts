import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberFormatDirective } from '../../../shared/directives/number-format.directive';

@Component({
  selector: 'app-newjob',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumberFormatDirective],
  templateUrl: './newjob.component.html',
  styleUrls: ['./newjob.component.scss']
})
export class NewjobComponent implements OnInit {
  step = 1;

  // Freight type states
  freightTypeLabel = '';
  isAirFreight = false;
  isSeaFreight = false;


  incotermsList = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];

  clients = [
    { id: 1, name: 'ABC Logistics', contact: 'John Doe', email: 'john@abc.com' },
    { id: 2, name: 'FastMove Cargo', contact: 'Jane Smith', email: 'jane@fastmove.com' },
    { id: 3, name: 'Blue Ocean Freight', contact: 'Robert Cruz', email: 'robert@blueocean.com' },
    { id: 4, name: 'SkyPort Handling', contact: 'Emily Tan', email: 'emily@skyport.com' },
    { id: 5, name: 'Portlink Transport', contact: 'Mike Lopez', email: 'mike@portlink.com' },
    { id: 6, name: 'FreightWorks', contact: 'Anna Reyes', email: 'anna@freightworks.com' }
  ];
  filteredClients = [...this.clients];
  clientSearch = '';
  dropdownOpen = false;

  jobDetailsForm!: FormGroup;
  freightForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Step 1 form
    this.jobDetailsForm = this.fb.group({
      clientInformation: ['', Validators.required],
      transactionType: ['', Validators.required],
      incoterms: ['', Validators.required],
      paymentType: ['', Validators.required],
      amount: ['', [Validators.required]]
    });

    // Step 2 form
    this.freightForm = this.fb.group({
      hawb: [''],
      mawb: [''],
      hbl: [''],
      mbl: [''],
      cutoff: [''],
      commodity: [''],
      eta: [''],
      etd: [''],
      origin: [''],
      destination: [''],
      weightCbm: [''],
      portCfs: [''],
      cartonsCount: [''],
      carrier: [''],
      pod: [''],
      consignee: [''],
      shipper: [''],
      vessel: [''],
      mode: [''],
      containerCount: [''],
      containerSize: [''],
      containerNumbers: [''],
      numberOfPackages: [''],
      grossWeight: [''],
      volume: [''],
      flt: [''],
      chargeableWeight: [''],
      remarks: [''],
      bookingNo: [''],
      agent: ['']
    });

  }



  // Transaction type logic
  onTransactionTypeChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement?.value || '';
    this.updateFreightFields(value);
  }
  updateFreightFields(value: string) {
    this.isAirFreight = ['FAE', 'FAI', 'CRA', 'DFA'].includes(value);
    this.isSeaFreight = ['FSE', 'FSI', 'CRS', 'DFS'].includes(value);

    if (this.isAirFreight) this.freightTypeLabel = 'Air Freight';
    else if (this.isSeaFreight) this.freightTypeLabel = 'Sea Freight';
    else this.freightTypeLabel = 'Other Type';

  }
  /** Client Search */
  onClientSearchChange(value: string) {
    this.clientSearch = value;
    this.filteredClients = this.clients.filter(c =>
      c.name.toLowerCase().includes(value.toLowerCase())
    );
    this.dropdownOpen = true;
  }

  /** Select Client */
  selectClient(client: any) {
    this.jobDetailsForm.patchValue({
      clientInformation: client.id
    });
    this.clientSearch = client.name;
    this.dropdownOpen = false;
  }

  /** Click outside dropdown */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.client-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  /** Restrict number input for Amount */
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
  if (s === 2) {
    if (this.jobDetailsForm.invalid) {
      this.jobDetailsForm.markAllAsTouched();
      return;
    }
  }
  // If validation passes, move to desired step
  this.step = s;
}


  nextStep() {
    if (this.step === 1) {
      if (this.jobDetailsForm.invalid) {
        this.jobDetailsForm.markAllAsTouched();
        return; 
      }
      this.step = 2;
    } else if (this.step === 2) {
      if (this.freightForm.invalid) {
        this.freightForm.markAllAsTouched();
        return;
      }
      this.finish();
    }
  }

  previousStep() {
    if (this.step > 1) this.step--;
  }

  finish() {
    console.log('Job Details:', this.jobDetailsForm.value);
    console.log('Freight Details:', this.freightForm.value);
    alert('Job successfully created!');
  }
}
