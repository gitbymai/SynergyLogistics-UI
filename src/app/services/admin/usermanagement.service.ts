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

  /**
   * Get all users
   */
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

  /**
   * Unlock user account
   */
  unlockUser(accountId: number): Observable<ApiResponse<Account>> {
    return this.http.patch<ApiResponse<Account>>(
      `${this.apiUrl}/${accountId}/unlock`,
      {}
    );
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/getroles`);
  }

  /**
   * Reset user password
   */
  resetUserPassword(accountId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${accountId}/reset-password`,
      {}
    );
  }

  /**
   * Change user password
   */
  changeUserPassword(
    accountId: number,
    currentPassword: string,
    newPassword: string
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/${accountId}/change-password`,
      {
        currentPassword,
        newPassword
      }
    );
  }

  /**
   * Bulk delete users
   */
  bulkDeleteUsers(accountIds: number[]): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/bulk-delete`,
      { accountIds }
    );
  }

  /**
   * Bulk update user status
   */
  bulkUpdateStatus(
    accountIds: number[],
    isActive: boolean
  ): Observable<ApiResponse<Account[]>> {
    return this.http.post<ApiResponse<Account[]>>(
      `${this.apiUrl}/bulk-update-status`,
      { accountIds, isActive }
    );
  }

  /**
   * Search users by term (name, email, code)
   */
  searchUsers(searchTerm: string): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(
      `${this.apiUrl}/search`,
      { params: { q: searchTerm } }
    );
  }

  /**
   * Get users by role
   */
  getUsersByRole(roleId: number): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(
      `${this.apiUrl}/role/${roleId}`
    );
  }

  /**
   * Get active users
   */
  getActiveUsers(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(
      `${this.apiUrl}/active`
    );
  }

  /**
   * Get locked users
   */
  getLockedUsers(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(
      `${this.apiUrl}/locked`
    );
  }

  /**
   * Export users to CSV
   */
  exportUsersToCSV(): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/csv`,
      { responseType: 'blob' }
    );
  }

  /**
   * Export users to Excel
   */
  exportUsersToExcel(): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/export/excel`,
      { responseType: 'blob' }
    );
  }

  /**
   * Get user login history
   */
  getUserLoginHistory(accountId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${accountId}/login-history`
    );
  }

  /**
   * Get user activity logs
   */
  getUserActivityLogs(accountId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${accountId}/activity-logs`
    );
  }
}