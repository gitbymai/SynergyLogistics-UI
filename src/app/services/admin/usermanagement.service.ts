import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '../../models/user';
import { Role } from '../../models/role';

@Injectable({
  providedIn: 'root'
})
export class UsermanagementService extends ApiService {

  private apiUrl = `${this.baseUrl}/account`;

  constructor(http: HttpClient) {
    super(http); // Call parent constructor
  }

  getAllUsers(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.apiUrl}/getall`);
  }

  getUserById(accountId: number): Observable<ApiResponse<Account>> {
    return this.http.get<ApiResponse<Account>>(`${this.apiUrl}/${accountId}`);
  }

  createUser(dto: CreateAccountRequest): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(`${this.apiUrl}/create`, dto);
  }

  updateUser(dto: UpdateAccountRequest): Observable<ApiResponse<Account>> {
    return this.http.put<ApiResponse<Account>>(`${this.apiUrl}`, dto);
  }

  deleteUser(accountId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${accountId}`);
  }

  toggleUserStatus(guid: string, isActive: boolean): Observable<ApiResponse<Account>> {
    return this.http.patch<ApiResponse<Account>>(
      `${this.apiUrl}/${guid}/status`,
      { isActive }
    );
  }

  unlockUser(accountId: number): Observable<ApiResponse<Account>> {
    return this.http.patch<ApiResponse<Account>>(
      `${this.apiUrl}/${accountId}/unlock`,
      {}
    );
  }

  getAllRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/getroles`);
  }

  forcePasswordReset(guid: string): Observable<ApiResponse<Account>> {
    return this.http.post<ApiResponse<Account>>(`${this.apiUrl}/force-change/${guid}`, {});
  }

  changeUserPassword(
    accountGuid: string,
    newPassword: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/change-password`,
      {
        accountGuid,
        newPassword
      }
    );
  }

}