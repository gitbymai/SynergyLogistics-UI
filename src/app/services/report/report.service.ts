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
export class ReportService extends ApiService{
  
   private apiUrl = `${this.baseUrl}`;

     constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

    getallRefunds(): Observable<ApiResponse<Refund[]>> {
    return this.http.get<ApiResponse<Refund[]>>(`${this.apiUrl}/report/refund-list`);
  }

    getallActualReleasedPettyCash(): Observable<ApiResponse<ChargeTransaction[]>> {
    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/report/pettycash-released-list`);
  }
  
}
