import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { Refund, NewRefund, UpdateRefund } from '../../models/refund';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefundService extends ApiService {

   private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  getallRefunds(): Observable<ApiResponse<Refund[]>> {
    return this.http.get<ApiResponse<Refund[]>>(`${this.apiUrl}/refund/list`);
  }

  getRefundByGuid(guid: string): Observable<ApiResponse<Refund>> {
    return this.http.get<ApiResponse<Refund>>(`${this.apiUrl}/refund/${guid}`);
  }

  createRefund(newRefundDto: NewRefund): Observable<ApiResponse<Refund>> {
    return this.http.post<ApiResponse<Refund>>(`${this.apiUrl}/refund`, newRefundDto);
  }

  updateRefund(updateRefundDto: UpdateRefund): Observable<ApiResponse<Refund>> {
    return this.http.put<ApiResponse<Refund>>(`${this.apiUrl}/refund`, updateRefundDto);
  }

  getbyChargeId(chargeId: number): Observable<ApiResponse<Refund>> {
    return this.http.get<ApiResponse<Refund>>(`${this.apiUrl}/refund/bychargeid/${chargeId}`);
  }

}
