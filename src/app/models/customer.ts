export interface CustomerAccount {
  customerId: number;
  customerCode: string;
  customerGuid: string;
  customerName: string;
  mainAddress: string;
  city: string;
  state: string;
  contactPerson: string;
  contactNumber: string;
  emailAddress: string;
  taxIdentificationNumber: string;
  optionClientCategoryId: number;
  optionIndustryId: number;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  modifiedBy: number;
  modifiedDate: Date;
}

// Helper function to convert API response to model
export function toCustomerAccount(data: any): CustomerAccount {
  return {
    ...data,
    createdDate: new Date(data.createdDate),
    modifiedDate: new Date(data.modifiedDate)
  };
}