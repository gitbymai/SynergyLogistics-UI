export interface NewCondepTransaction {
  condepId: number;
  optionCondepTransactionTypeId: number;
  amount: number;
  referenceNumber?: string;
  notes?: string;
  jobId: number;
  isReimbursement?: boolean;
}

export interface UpdateCondepTransaction {
  condepTransactionId: number;
  condepTransactionGuid: string;
  referenceNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CondepTransaction {
  condepTransactionId: number;
  condepTransactionGuid: string;
  condepId: number;
  condepGuid?: string;
  condepName?: string;
  optionCondepTransactionTypeId: number;
  transactionTypeName?: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceNumber?: string;
  notes?: string;
  createdBy: number;
  createdDate?: string;
  modifiedBy: number;
  modifiedDate?: string;
  isActive: boolean;
  createdByName?: string;
  modifiedByName?: string;
  condepTransactionTypeName?: string;
  condepTypeName?: string;
  condepTransactionStatusId?: number;
  condepTransactionStatusName?: string;
  chargeId?: number;
  jobId?: number;
  jobCode?: string;
  chargeCode?: string;
  isReimbursement?: boolean;
}

export interface NewCondep {
  condepName: string;
  optionCondepTypeId: number;
  addedAmount: number;
  currentAmount: number;
}

export interface UpdateCondep {
  condepId: number;
  condepGuid: string;
  condepName: string;
  currentAmount: number;
  isActive?: boolean;
}

export interface Condep {
  condepId: number;
  condepGuid: string;
  condepName: string;
  optionCondepTypeId: string;
  condepTypeName?: string;
  addedAmount: number;
  currentAmount: number;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
  createdByName?: string;
  modifiedByName?: string;
}