export interface CreateJobRequest {
  // Job Details
  clientInformationId: number;
  transactionTypeId: number;
  incotermsId: number;
  paymentTypeId: number;
  amount: number;

  // Shipment Details
  cutoff?: string;
  etd?: string;
  eta?: string;
  origin?: string;
  destination?: string;
  portCfs?: string;
  commodity?: string;
  
  // Weight & Volume
  grossWeight?: number;
  volume?: number;
  chargeableWeight?: number;
  numberOfPackages?: number;
  
  // Container Details (Sea)
  containerType?: string;
  containerCount?: number;
  
  // Freight Documents
  // Sea Freight
  mbl?: string;
  hbl?: string;
  vessel?: string;
  
  // Air Freight  
  mawb?: string;
  hawb?: string;
  flightNo?: string;
  
  // Common
  bookingNo?: string;
  carrier?: string;
  shipper?: string;
  consignee?: string;
  agent?: string;
  remarks?: string;
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
}