import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { Refund, NewRefund, UpdateRefund } from '../../models/refund';
import { map } from 'rxjs';
import { ChargeTransaction } from '../../models/chargetransaction';

@Injectable({
  providedIn: 'root',
})
export class ReportService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  getallRefunds(dateFrom?: string, dateTo?: string): Observable<ApiResponse<Refund[]>> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<ApiResponse<Refund[]>>(`${this.apiUrl}/report/refund-list`, { params });
  }

  getallActualReleasedPettyCash(dateFrom?: string, dateTo?: string): Observable<ApiResponse<ChargeTransaction[]>> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/report/pettycash-released-list`, { params });
  }

}
