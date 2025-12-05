export interface CreateChargeTransactionRequest {
  // Charge Details
  chargeSubCategoryId: number;
  description?: string | null;
  amount: number;
  jobId: number;
  
}

export interface UpdateChargeTransactionRequest extends CreateChargeTransactionRequest {
  chargeId: number;
  chargeGuid: string;
  
  // Date & User Tracking
  closeDate?: string | null;
  closedBy?: number | null;
  cancelledDate?: string | null;
  cancelledBy?: number | null;
  completedDate?: string | null;
  completedBy?: number | null;
}

export interface ChargeTransaction {
  // Primary Keys
  chargeId: number;
  chargeCode: string;
  chargeGuid: string;
  
  // Category Information (Joined)
  chargeCategoryName?: string | null;
  chargeSubCategoryId: number;
  chargeSubCategoryName?: string | null;
  
  // Charge Details
  description?: string | null;
  amount: number;
  currencyCode: string;
  
  // Job Reference
  jobId: number;
  jobGuid?: string | null;
  jobCode: string;
  
  // Status
  optionChargeStatusId: number;
  chargeTransactionStatus?: string | null;
  chargeTransactionCategoryCode?: string | null;
  
  // Date & User Tracking
  closeDate?: string | null;
  closedBy?: number | null;
  cancelledDate?: string | null;
  cancelledBy?: number | null;
  completedDate?: string | null;
  completedBy?: number | null;
  
  // Audit Fields
  createdDate: string;
  createdBy: number;
  modifiedDate?: string | null;
  modifiedBy?: number | null;
  isActive?: boolean | null;
}