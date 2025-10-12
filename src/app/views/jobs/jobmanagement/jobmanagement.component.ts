import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardModule,
  AccordionModule,
  ButtonModule,
  BadgeModule,
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
import { RouterModule } from '@angular/router';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { JobChargesComponent } from '../../jobs/jobcharges/jobcharges.component';

@Component({
  selector: 'app-jobmanagement',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AccordionModule,
    ButtonModule,
    BadgeModule,
    IconModule,
    RouterModule, HttpClientModule,
    JobChargesComponent
  ],
  templateUrl: './jobmanagement.component.html',
  styleUrls: ['./jobmanagement.component.scss'],

})
export class JobmanagementComponent implements OnInit {
  job: any;
  charges: Array<{ description: string; amount: number; type: string }> = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Simulated job data
    this.job = {
      id: 1001,
      client: { name: 'ABCS Logistics' },
      transactionType: 'FSE - Sea Export',
      incoterms: 'FOB',
      paymentType: 'Prepaid',
      amount: 25000,
      cutoff: '2025-10-12',
      eta: '2025-10-20',
      etd: '2025-10-15',
      origin: 'Manila Port',
      destination: 'Singapore Port',
      portCfs: 'Portlink CFS',
      mbl: 'MBL123456',
      hbl: 'HBL654321',
      vessel: 'MV Ocean Star',
      containerCount: 2,
      containerSize: '40HQ',
      containerNumbers: 'C12345, C12346',
      grossWeight: '20000kg',
      volume: '60 CBM',
      status: 'In Transit',
      commodity: 'Electronics',
      carrier: 'Maersk',
      agent: 'XYZ Agent',
      remarks: 'Handle with care',
      freightType: 'Sea Freight', // or 'Air Freight'
      freightTypeLabel: 'Sea Freight',
      mawb: 'MAWB12345',
      hawb: 'HAWB54321',
      flt: 'PR123',
      chargeableWeight: '500kg',
      createdDate: '2025-10-01'
    };


    this.charges = [
      { description: 'Freight', amount: 15000, type: 'Charge' },
      { description: 'Customs Duty', amount: 5000, type: 'Disbursement' },
      { description: 'Handling Fee', amount: 2000, type: 'Charge' }
    ];
  }

  printJobDetails(): void {
    if (!this.job) return;

    this.http.get('assets/print-templates/job-details.html', { responseType: 'text' })
      .subscribe(template => {
        const job = this.job;

        // Generate dynamic freight HTML
        let freightHtml = '';
        if (job.freightType === 'Sea Freight') {
          freightHtml = `
            <div class="col-print field-row"><label>MBL Reference</label><div>${job.mbl || '-'}</div></div>
            <div class="col-print field-row"><label>HBL Reference</label><div>${job.hbl || '-'}</div></div>
            <div class="col-print field-row"><label>Vessel</label><div>${job.vessel || '-'}</div></div>
            <div class="col-print field-row"><label>Container Count</label><div>${job.containerCount || '-'}</div></div>
            <div class="col-print field-row"><label>Container Size</label><div>${job.containerSize || '-'}</div></div>
            <div class="col-print field-row"><label>Container Numbers</label><div>${job.containerNumbers || '-'}</div></div>
            <div class="col-print field-row"><label>Gross Weight</label><div>${job.grossWeight || '-'}</div></div>
            <div class="col-print field-row"><label>Volume (CBM)</label><div>${job.volume || '-'}</div></div>
          `;
        } else if (job.freightType === 'Air Freight') {
          freightHtml = `
            <div class="col-print field-row"><label>MAWB Reference</label><div>${job.mawb || '-'}</div></div>
            <div class="col-print field-row"><label>HAWB Reference</label><div>${job.hawb || '-'}</div></div>
            <div class="col-print field-row"><label>Flight No.</label><div>${job.flt || '-'}</div></div>
            <div class="col-print field-row"><label>Chargeable Weight</label><div>${job.chargeableWeight || '-'}</div></div>
          `;
        }

        // Replace placeholders in template
        let filledTemplate = template
          .replace('{{client}}', job.client?.name || '-')
          .replace('{{transactionType}}', job.transactionType || '-')
          .replace('{{incoterms}}', job.incoterms || '-')
          .replace('{{paymentType}}', job.paymentType || '-')
          .replace('{{amount}}', `₱${job.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}`)
          .replace('{{createdDate}}', job.createdDate ? new Date(job.createdDate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-')
          .replace('{{status}}', job.status || 'Pending')
          .replace('{{commodity}}', job.commodity || '-')
          .replace('{{cutoff}}', job.cutoff ? new Date(job.cutoff).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '-')
          .replace('{{carrier}}', job.carrier || '-')
          .replace('{{origin}}', job.origin || '-')
          .replace('{{destination}}', job.destination || '-')
          .replace('{{portCfs}}', job.portCfs || '-')
          .replace('{{agent}}', job.agent || '-')
          .replace('{{remarks}}', job.remarks || '-')
          .replace('{{freightTypeLabel}}', job.freightTypeLabel || 'N/A')
          .replace('{{freightDetails}}', freightHtml)
          .replace('{{printFooter}}', `Printed on ${new Date().toLocaleString('en-PH')}`);

        // Open print window
        const popupWin = window.open('', '_blank', 'width=900,height=600');
        if (!popupWin) return;
        popupWin.document.open();
        popupWin.document.write(filledTemplate);
        popupWin.document.close();
      });
  }
}


