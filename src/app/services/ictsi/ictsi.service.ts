import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { Configuration } from '../../models/configuration'
import { Ictsi, IctsiTransaction, NewIctsi, NewIctsiTransaction, UpdateIctsi, UpdateIctsiTransaction } from '../../models/ictsi'

@Injectable({
  providedIn: 'root',
})
export class IctsiService extends ApiService {
  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }
  getAllIctsi(): Observable<ApiResponse<Ictsi[]>> {
    return this.http.get<ApiResponse<Ictsi[]>>(`${this.apiUrl}/ictsi`);
  }

  getIctsiByGuid(guid: string): Observable<ApiResponse<Ictsi>> {
    return this.http.get<ApiResponse<Ictsi>>(`${this.apiUrl}/ictsi/${guid}`);
  }

  createIctsi(newIctsiDto: NewIctsi): Observable<ApiResponse<Ictsi>> {
    return this.http.post<ApiResponse<Ictsi>>(`${this.apiUrl}/ictsi`, newIctsiDto);
  }

  updateIctsi(updateIctsiDto: UpdateIctsi): Observable<ApiResponse<Ictsi>> {
    return this.http.put<ApiResponse<Ictsi>>(`${this.apiUrl}/ictsi`, updateIctsiDto);
  }

  deleteIctsi(guid: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/ictsi/${guid}`);
  }

  activateIctsi(guid: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/ictsi/activate/${guid}`, {});
  }

  deactivateIctsi(guid: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/ictsi/deactivate/${guid}`, {});
  }

  getIctsiTransactionsByIctsiId(id: number): Observable<ApiResponse<IctsiTransaction[]>> {
    return this.http.get<ApiResponse<IctsiTransaction[]>>(`${this.apiUrl}/ictsi/transactions/${id}`);
  }

  addIctsiTransaction(newIctsiTransactionDto: NewIctsiTransaction): Observable<ApiResponse<IctsiTransaction>> {
    return this.http.post<ApiResponse<IctsiTransaction>>(`${this.apiUrl}/ictsi/transactions`, newIctsiTransactionDto);
  }
  
  getResourceTransactionTypes(): Observable<ApiResponse<Configuration[]>> {
    return this.http.get<ApiResponse<Configuration[]>>(`${this.apiUrl}/configuration/resource-transaction-type`);
  }

}
