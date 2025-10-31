import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from 'src/app/models/api-response';
import { Agency, NewAgency, UpdateAgency } from 'src/app/models/agency';

@Injectable({
  providedIn: 'root'
})
export class AgencyService extends ApiService {
  private apiUrl = `${this.baseUrl}/agency`;
  
  constructor(http: HttpClient) {
    super(http);
  }

  getAllAgencies(): Observable<ApiResponse<Agency[]>> {
    return this.http.get<ApiResponse<Agency[]>>(this.apiUrl);
  }

  getAgencyByGuid(guid: string): Observable<ApiResponse<Agency>> {
    return this.http.get<ApiResponse<Agency>>(`${this.apiUrl}/${guid}`);
  }

  createAgency(agency: NewAgency): Observable<ApiResponse<Agency>> {
    return this.http.post<ApiResponse<Agency>>(this.apiUrl, agency);
  }

  updateAgency(guid: string, agency: UpdateAgency): Observable<ApiResponse<Agency>> {
    return this.http.put<ApiResponse<Agency>>(`${this.apiUrl}/${guid}`, agency);
  }

  deleteAgency(guid: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${guid}`);
  }

  activateAgency(guid: string): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/activate/${guid}`, {});
  }
}