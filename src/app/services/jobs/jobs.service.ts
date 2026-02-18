import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { CustomerAccount, toCustomerAccount } from '../../models/customer';
import { map } from 'rxjs';
import { CreateJobRequest, Job } from '../../models/job';
import { JobTransactionType } from '../../models/jobtransactiontype';
import { ChargeTransaction } from '../../models/chargetransaction';

@Injectable({
  providedIn: 'root'
})

export class JobsService extends ApiService {

  private apiUrl = `${this.baseUrl}`;

  constructor(http: HttpClient) {
    super(http);  // Call parent constructor
  }

  getAllCustomers(): Observable<ApiResponse<CustomerAccount[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/customer/get-all`).pipe(
      map(response => {
        const customers = response.data.map(item => toCustomerAccount(item));
        return { ...response, data: customers };
      })
    );
  }

  getAllConfigurations(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/configuration`);
  }

  getJobTransactionTypes(): Observable<ApiResponse<JobTransactionType[]>> {
    return this.http.get<ApiResponse<JobTransactionType[]>>(`${this.apiUrl}/jobtransactiontype`);
  }

  getAllJobs(dateFrom?: string, dateTo?: string): Observable<ApiResponse<Job[]>> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/job-list`, { params });
  }

  getAllJobsByCashierWithRequest(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/getall-cashier`);
  }

  getAllJobsByTreasurerWithRequest(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/getall-treasurer`);
  }

  getAllJobsBySalesWithRequest(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/getall-sales`);
  }

  getAllJobTransactionAssignedToUser(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/getall-assigned-to-user`);
  }

  getAllJobTransactionNoAssignedUser(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/job/getall-no-assigned`);
  }

  getByGuid(jobGuid: string): Observable<Job> {
    return this.http.get<ApiResponse<Job>>(`${this.apiUrl}/job/${jobGuid}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Job not found');
      })
    );
  }

  createJob(job: CreateJobRequest): Observable<ApiResponse<Job>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/job`, job);
  }

  approveJob(jobGuid: string): Observable<ApiResponse<Job>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/job/approve/${jobGuid}`, {});
  }

  disapproveJob(jobGuid: string): Observable<ApiResponse<Job>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/job/disapprove/${jobGuid}`, {});
  }

  closeJob(jobGuid: string): Observable<ApiResponse<Job>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/job/close/${jobGuid}`, {});
  }

  replicateJob(jobGuid: string): Observable<ApiResponse<Job>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/job/replicate/${jobGuid}`, {});
  }

  getAllChargeTransactionByGuid(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges`);
  }
  getAllChargeTransactionByGuidByTreasurer(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges/treasurer`);
  }

  getAllChargeTransactionByGuidByCashier(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges/cashier`);
  }

  getAllChargeTransactionByGuidBySales(jobGuid: string): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/${jobGuid}/charges/sales`);
  }

  //ends here
  getAllChargeTransactionCharges(): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/jobtransaction/charges`);
  }

  getAllChargeTransactionExpenses(): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/jobtransaction/expenses`);
  }

  getAllChargeTransactionDisbursements(): Observable<ApiResponse<ChargeTransaction[]>> {

    return this.http.get<ApiResponse<ChargeTransaction[]>>(`${this.apiUrl}/job/jobtransaction/disbursements`);
  }

  getChargeTransactionByRole(role: string): Observable<ApiResponse<ChargeTransaction[]>> {

    const params = new HttpParams().set('role', role);
    return this.http.get<ApiResponse<ChargeTransaction[]>>(
      `${this.apiUrl}/job/jobtransaction/rolebased`,
      { params }
    );
  }
}