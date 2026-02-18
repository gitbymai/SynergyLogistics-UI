export interface CreateChargeTransactionRequest {
  // Charge Details
  chargeSubCategoryId: number;
  description?: string | null;
  amount: number;
  amountSelling: number;
  jobId: number;
  isForProcessing?: boolean | false;
  currencyCode: string;
  conversionRate: number;
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
  amountSelling: number;
  currencyCode: string;
  
  // Job Reference
  jobId: number;
  jobGuid?: string | null;
  jobCode: string;
  jobClientName: string;
  jobPaymentType: string;
  jobTransactionType: string;
  
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
  createdDate: Date;
  createdBy: number;
  modifiedDate?: string | null;
  modifiedBy?: number | null;
  isActive?: boolean | null;
  isForProcessing?: boolean | null;
  isForDisbursement?: boolean | null;
  chargeCategoryId?: number | null;

  closedByName?: string | null;
  cancelledByName?: string | null;
  completedByName?: string | null;
  createdByName?: string | null;
  modifiedByName?: string | null;
  
  conversionRate: number;
  calculatedAmount: number;
  calculatedSellingAmount: number;

  processorOwner?: number;
  processorOwnerName?: string | null;
  masterAirwayBill?: string | null;
  houseAirwayBill?: string | null;
  masterBillLading?: string | null;
  houseBillLading?: string | null;
}

export interface ChargeTransactionAuditLog {
  id: number;
  chargeId: number;
  chargeCode: string;
  amount: number;
  previousStatus?: string | null;
  newStatus: string;
  actionType: string;
  remarks?: string | null;
  requestedBy?: string | null;
  modifiedBy: string;
  createDate: Date;
}