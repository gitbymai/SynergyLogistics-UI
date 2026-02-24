export interface NewIctsiTransaction {
  ictsiId: number;
  optionIctsiTransactionTypeId: number;
  amount: number;
  referenceNumber?: string;
  notes?: string;
  jobId: string;
  isReimbursement?: boolean;
}

export interface UpdateIctsiTransaction {
  ictsiTransactionId: number;
  ictsiTransactionGuid: string;
  ictsiId: number;
  optionIctsiTransactionTypeId: number;
  amount: number;
  referenceNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface IctsiTransaction {
  ictsiTransactionId: number;
  ictsiTransactionGuid: string;
  ictsiId: number;
  ictsiGuid?: string;
  ictsiName?: string;
  optionIctsiTransactionTypeId: number;
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
  ictsiTransactionTypeName?: string;
  isReimbursement?: boolean;
  jobId?: number;
  jobCode?: string;
  ictsiTransactionStatusId?: number;
  ictsiTransactionStatusName?: string;
  chargeId?: number;
  chargeCode?: string;
}

export interface NewIctsi {
  ictsiName: string;
  addedAmount: number;
  currentAmount: number;
}

export interface UpdateIctsi {
  ictsiId: number;
  ictsiGuid: string;
  ictsiName: string;
  currentAmount: number;
  isActive?: boolean;
}

export interface Ictsi {
  ictsiId: number;
  ictsiGuid: string;
  ictsiName: string;
  addedAmount: number;
  currentAmount: number;
  usedAmount: number;
  depletionPercentage: number;
  createdBy: number;
  createdDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
  isActive: boolean;
  createdByName?: string;
  modifiedByName?: string;
}