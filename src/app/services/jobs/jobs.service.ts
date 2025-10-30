import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { CustomerAccount, toCustomerAccount } from '../../models/customer';
import { map } from 'rxjs';
import { CreateJobRequest, Job } from '../../models/job-new';

@Injectable({
  providedIn: 'root'
})

export class JobsService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  getAllCustomers(): Observable<ApiResponse<CustomerAccount[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/customer`).pipe(
      map(response => {
        const customers = response.data.map(item => toCustomerAccount(item));
        return { ...response, data: customers };
      })
    );
  }

  getAllConfiguratios(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/configuration`);
  }

  getAllJobs(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  getJobById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  createJob(job: CreateJobRequest): Observable<ApiResponse<Job>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, job);
  }

  updateJob(id: number, job: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, job);
  }

  deleteJob(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}