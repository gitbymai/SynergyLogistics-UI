import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { 
  ChargeTransaction, 
  CreateChargeTransactionRequest, 
  UpdateChargeTransactionRequest 
} from '../../models/chargetransaction';

@Injectable({
  providedIn: 'root'
})
export class ChargeTransactionService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  /**
   * Get all charge transactions by job GUID
   */
  getChargesByJobGuid(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges`);
  }

  /**
   * Get charge transaction by charge GUID
   */
  getChargeByGuid(chargeGuid: string): Observable<ChargeTransaction> {
    return this.http.get<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/${chargeGuid}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Charge not found');
      })
    );
  }
  
  /**
   * Get all charge transactions
   */
  getAllCharges(): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge`);
  }

  /**
   * Create a new charge transaction
   */
  createCharge(charge: CreateChargeTransactionRequest): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.post<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge`, charge);
  }

  /**
   * Update an existing charge transaction
   */
  updateCharge(chargeGuid: string, charge: UpdateChargeTransactionRequest): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/${chargeGuid}`, charge);
  }

  /**
   * Delete a charge transaction (soft delete)
   */
  deleteCharge(chargeGuid: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/charge/${chargeGuid}`);
  }

  /**
   * Activate a charge transaction
   */
  activateCharge(chargeGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/activate/${chargeGuid}`, {});
  }

  /**
   * Get charge subcategories (for dropdown)
   */
  getChargeSubcategories(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/chargesubcategory`);
  }

  /**
   * Get charge statuses (for dropdown)
   */
  getChargeStatuses(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/configuration/chargestatus`);
  }

  /**
   * Get charge categories (for dropdown)
   */
  getChargeCategories(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/chargecategory`);
  }

  /**
   * Get charges by status
   */
  getChargesByStatus(statusId: number): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge/status/${statusId}`);
  }

  /**
   * Get charges by category
   */
  getChargesByCategory(categoryId: number): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge/category/${categoryId}`);
  }

  /**
   * Approve charge transaction
   */
  approveCharge(chargeGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/${chargeGuid}/approve`, {});
  }

  /**
   * Cancel charge transaction
   */
  cancelCharge(chargeGuid: string, cancelledBy: number): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/${chargeGuid}/cancel`, { cancelledBy });
  }

  /**
   * Complete charge transaction
   */
  completeCharge(chargeGuid: string, completedBy: number): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/charge/${chargeGuid}/complete`, { completedBy });
  }


}