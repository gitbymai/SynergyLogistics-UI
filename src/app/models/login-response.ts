export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  user: {
    accountId: string;
    roleId: string;
    roleName: string;
    role: string;
    userName: string;
    fullName: string;
  };
  expiresIn: number;
}