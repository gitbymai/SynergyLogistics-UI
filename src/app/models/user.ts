export interface User {
  accountId: string;
  roleId: string;
  roleName: string;
  role: string;
  userName: string;
}

export interface Account {
  accountId: number;
  accountCode: string;
  accountGuid: string;
  accountName: string;
  email: string;
  phone: string;
  department: string;
  roleId: number;
  isActive: boolean;
  accountLocked: boolean;
  lastLogin: Date | null;
  createdDate: Date;
  modifiedDate: Date;
  createdBy: number;
  modifiedBy: number;
}

export interface CreateAccountRequest {
  accountCode: string;
  accountName: string;
  email: string;
  phone?: string;
  department?: string;
  roleId: number;
  password: string;
}

export interface UpdateAccountRequest {
  accountName: string;
  email: string;
  phone?: string;
  department?: string;
  roleId: number;
  isActive: boolean;
}
