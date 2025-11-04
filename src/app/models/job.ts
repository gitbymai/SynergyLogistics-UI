export interface CreateJobRequest {
  // Job Details
  clientInformationId: number;
  transactionTypeId: number;
  incotermsId: number;
  paymentTypeId: number;
  amount: number;

  // Shipment Freight Details
  cutoff?: string | null;
  etd?: string | null;
  eta?: string | null;
  origin?: string | null;
  destination?: string | null;
  portCfs?: string | null;
  commodity?: string | null;
  volume?: number | null;
  grossWeight?: number | null;
  numberOfPackages?: number | null;

  // Freight Details
  mbl?: string | null;
  hbl?: string | null;
  vessel?: string | null;
  containerType?: string | null;
  containerCount?: number | null;
  mawb?: string | null;
  hawb?: string | null;
  flightNo?: string | null;
  chargeableWeight?: number | null;
  bookingNo?: string | null;
  carrier?: string | null;
  shipper?: string | null;
  consignee?: string | null;
  agent?: string | null;
  remarks?: string | null;
}

export interface Job extends CreateJobRequest {
  jobId: number;
  jobCode: string;
  jobGuid: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy: number;
  modifiedDate: string;
  
  // Additional display/reference fields from API response
  customerName: string;
  jobStatusName: string;
  transactionTypeName: string;
  incotermsName: string;
  paymentTypeName: string;
}