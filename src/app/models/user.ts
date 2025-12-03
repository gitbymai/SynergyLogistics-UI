export interface User {
  accountId: string;
  roleId: string;
  roleName: string;
  role: string;
  userName: string;
  fullName: string;
}

export interface Account {
  accountId: number;
  accountCode: string;
  accountGuid: string;
  accountName: string;
  email: string;
  phone: string;
  department: string;
  role: number;
  isActive: boolean;
  accountLocked: boolean;
  lastLogin: Date | null;
  createdDate: Date;
  modifiedDate: Date;
  createdBy: number;
  modifiedBy: number;
}

export interface CreateAccountRequest {
  accountName: string;
  email: string;
  phone?: string;
  department?: string;
  roleId: number;
}

export interface UpdateAccountRequest {
  accountGuid: string;
  accountName: string;
  email: string;
  phone?: string;
  department?: string;
  roleId: number;
  isActive: boolean;
  password?: string;
}
