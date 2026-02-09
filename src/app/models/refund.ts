export interface NewRefund {
  chargeId: number;
  refundAmount: number;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdateRefund {
  refundId: number;
  refundGuid: string;
  chargeId: number;
  refundAmount: number;
  referenceNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface Refund {
  refundId: number;
  refundGuid: string;
  chargeId: number;
  refundAmount: number;
  referenceNumber?: string;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
  isActive: boolean;
  
  // Charge transaction fields
  amount: number;
  currencyCode?: string;
  chargeSubcategoryId?: number;
  chargeCode?: string;
  description?: string;
  jobId?: number;
  processorOwner?: string;
  
  // Job fields
  jobCode?: string;
  masterBillLading?: string;
  houseBillLading?: string;
  masterAirWaybill?: string;
  houseAirWaybill?: string;
  optionPaymentTypeId?: number;
  optionIncotermId?: number;
  jobTransactionTypeId?: number;
  
  // Lookup values
  paymentTypeName?: string;
  incotermsName?: string;
  transactionTypeName?: string;
  
  // Audit fields
  createdByName?: string;
  modifiedByName?: string;
}