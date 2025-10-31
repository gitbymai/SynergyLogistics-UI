export interface Agency {
  agencyId: number;
  agencyCode: string;
  agencyGuid: string;
  agentName: string;
  contactPerson: string;
  address: string;
  contactNumber?: string;
  emailAddress: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string; // or Date
  modifiedBy?: number;
  modifiedDate?: string; // or Date
}

export interface NewAgency {
  agentName: string;
  contactPerson: string;
  address: string;
  contactNumber?: string;
  emailAddress: string;
}

export interface UpdateAgency {
  agencyGuid: string;
  contactPerson: string;
  address: string;
  contactNumber: string;
  emailAddress: string;
}