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
    super(http);
  }


  getChargesByJobGuid(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges`);
  }


  getChargeByGuid(chargeGuid: string): Observable<ChargeTransaction> {
    return this.http.get<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/manage/${chargeGuid}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Charge not found');
      })
    );
  }

  getAllCharges(): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge`);
  }

  createCharge(charge: CreateChargeTransactionRequest): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/job/jobtransaction/createcharge`, charge);
  }

  updateCharge(chargeGuid: string, charge: UpdateChargeTransactionRequest): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/updatecharge/${chargeGuid}`, charge);
  }

  getChargeSubcategories(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/devconfig/charge-subcategory`);
  }

  getChargeStatuses(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/configuration/chargestatus`);
  }

  getChargeCategories(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/chargecategory`);
  }

  getChargesByStatus(statusId: number): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge/status/${statusId}`);
  }

  getChargesByCategory(categoryId: number): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/charge/category/${categoryId}`);
  }

  approveCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/approvecharge/${tranGuid}`, {});
  }

  rejectCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/rejectcharge/${tranGuid}`, {});
  }

  cancelCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/cancelcharge/${tranGuid}`, {});
  }

  completeCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/complete/${tranGuid}`, {});
  }


  releaseCashCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/releasecashcharge/${tranGuid}`, {});
  }

  confirmCashReleaseCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/actualcashrelease/${tranGuid}`, {});
  }

  submitForClearingCharge(tranGuid: string): Observable<ApiResponse<ChargeTransaction>> {
    return this.http.put<ApiResponse<ChargeTransaction>>(`${this.apiUrl}/job/jobtransaction/forclearing/${tranGuid}`, {});
  }
  

}