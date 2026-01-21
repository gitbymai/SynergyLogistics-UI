export interface NewResourceTransaction {
  resourceId: number;
  optionResourceTransactionTypeId: number;
  amount: number;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdateResourceTransaction {
  transactionId: number;
  transactionGuid: string;
  referenceNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ResourceTransaction {
  transactionId: number;
  transactionGuid: string;
  resourceId: number;
  resourceGuid?: string;
  resourceName?: string;
  optionResourceTransactionTypeId: number;
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
  resourceTransactionTypeName?: string;
  resourceTypeName?: string;
}

export interface NewResource {
  resourceName: string;
  optionResourceTypeId: number;
  addedAmount: number;
  currentAmount: number;
}

export interface UpdateResource {
  resourceId: number;
  resourceGuid: string;
  resourceName: string;
  currentAmount: number;
  isActive?: boolean;
}

export interface Resource {
  resourceId: number;
  resourceGuid: string;
  resourceName: string;
  optionResourceTypeId: string;
  resourceTypeName?: string;
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
