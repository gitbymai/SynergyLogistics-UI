import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { map } from 'rxjs';
import { Condep, CondepTransaction, NewCondepTransaction, UpdateCondepTransaction } from '../../models/condep';
import { Configuration } from '../../models/configuration'

@Injectable({
  providedIn: 'root',
})
export class CondepService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }
  
  getCondepTransactionsByCondepId(id: number, dateFrom?: string, dateTo?: string): Observable<ApiResponse<CondepTransaction[]>> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<ApiResponse<CondepTransaction[]>>(`${this.apiUrl}/condep/transactions/${id}`, { params });
  }

  addCondepTransaction(newCondepTransactionDto: NewCondepTransaction): Observable<ApiResponse<CondepTransaction>> {
    return this.http.post<ApiResponse<CondepTransaction>>(`${this.apiUrl}/condep/transactions`, newCondepTransactionDto);
  }

  getCondepTransactionTypes(): Observable<ApiResponse<Configuration[]>> {
    return this.http.get<ApiResponse<Configuration[]>>(`${this.apiUrl}/configuration/condep-transaction-type`);
  }

  cancelCondepTransaction(guid: string, cancellationReason: string): Observable<ApiResponse<void>> {
    let params = new HttpParams();
    if (cancellationReason) params = params.set('cancellationReason', cancellationReason);
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/condep/transactions/cancel/${guid}`, null, { params });
  }

}
