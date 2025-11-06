export interface CreateChargeTransactionRequest {
  // Charge Details
  chargecode: string;
  chargesubcategoryid: number;
  description?: string | null;
  amount: number;
  currencycode: string;
  
  // Job Reference
  jobid: number;
  
  // Status
  optionchargestatusid: number;
  chargetransactioncategorycode?: string | null;
  isactive?: boolean | null;
}

export interface UpdateChargeTransactionRequest extends CreateChargeTransactionRequest {
  chargeid: number;
  chargeguid: string;
  
  // Date & User Tracking
  closedate?: string | null;
  closedby?: number | null;
  cancelleddate?: string | null;
  cancelledby?: number | null;
  completeddate?: string | null;
  completedby?: number | null;
}

export interface ChargeTransaction {
  // Primary Keys
  chargeid: number;
  chargecode: string;
  chargeguid: string;
  
  // Category Information (Joined)
  chargecategoryname?: string | null;
  chargesubcategoryid: number;
  chargesubcategoryname?: string | null;
  
  // Charge Details
  description?: string | null;
  amount: number;
  currencycode: string;
  
  // Job Reference
  jobid: number;
  jobguid?: string | null;
  
  // Status
  optionchargestatusid: number;
  chargestransactionstatus?: string | null;
  chargetransactioncategorycode?: string | null;
  
  // Date & User Tracking
  closedate?: string | null;
  closedby?: number | null;
  cancelleddate?: string | null;
  cancelledby?: number | null;
  completeddate?: string | null;
  completedby?: number | null;
  
  // Audit Fields
  createddate: string;
  createdby: number;
  modifieddate?: string | null;
  modifiedby?: number | null;
  isactive?: boolean | null;
}