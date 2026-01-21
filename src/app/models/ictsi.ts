export interface NewIctsiTransaction {
  ictsiId: number;
  optionIctsiTransactionTypeId: number;
  amount: number;
  referenceNumber?: string;
  notes?: string;
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
  createdDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
  isActive: boolean;
  createdByName?: string;
  modifiedByName?: string;
  ictsiTransactionTypeName?: string;
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