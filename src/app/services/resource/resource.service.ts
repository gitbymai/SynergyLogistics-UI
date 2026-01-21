import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { map } from 'rxjs';
import { Resource, NewResource, UpdateResource, ResourceTransaction, NewResourceTransaction, UpdateResourceTransaction } from '../../models/resource';
import { Configuration } from '../../models/configuration'


@Injectable({
  providedIn: 'root',
})
export class ResourceService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  getAllResources(): Observable<ApiResponse<Resource[]>> {
    return this.http.get<ApiResponse<Resource[]>>(`${this.apiUrl}/resource`);
  }

  getResourceByGuid(guid: string): Observable<ApiResponse<Resource>> {
    return this.http.get<ApiResponse<Resource>>(`${this.apiUrl}/resource/${guid}`);
  }

  createResource(newResourceDto: NewResource): Observable<ApiResponse<Resource>> {
    return this.http.post<ApiResponse<Resource>>(`${this.apiUrl}/resource`, newResourceDto);
  }

  updateResource(updateResourceDto: UpdateResource): Observable<ApiResponse<Resource>> {
    return this.http.put<ApiResponse<Resource>>(`${this.apiUrl}/resource`, updateResourceDto);
  }

  deleteResource(guid: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/resource/${guid}`);
  }

  activateResource(guid: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/resource/activate/${guid}`, {});
  }

  deactivateResource(guid: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/resource/deactivate/${guid}`, {});
  }

  getResourceTransactionsByResourceId(id: number): Observable<ApiResponse<ResourceTransaction[]>> {
    return this.http.get<ApiResponse<ResourceTransaction[]>>(`${this.apiUrl}/resource/transactions/${id}`);
  }

  addResourceTransaction(newResourceTransactionDto: NewResourceTransaction): Observable<ApiResponse<ResourceTransaction>> {
    return this.http.post<ApiResponse<ResourceTransaction>>(`${this.apiUrl}/resource/transactions`, newResourceTransactionDto);
  }

  getResourceTransactionTypes(): Observable<ApiResponse<Configuration[]>> {
    return this.http.get<ApiResponse<Configuration[]>>(`${this.apiUrl}/configuration/resource-transaction-type`);
  }

}