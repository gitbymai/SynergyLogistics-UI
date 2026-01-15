import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ApiResponse } from '../../models/api-response';
import { CustomerAccount, NewCustomerAccount, UpdateCustomerAccount } from '../../models/customer';


@Injectable({
    providedIn: 'root'
})

export class CustomerManagementService extends ApiService {
    private apiUrl = `${this.baseUrl}/customer`;

    constructor(http: HttpClient) {
        super(http); // Call parent constructor
    }

    getAllCustomers(): Observable<ApiResponse<CustomerAccount[]>> {
        return this.http.get<ApiResponse<CustomerAccount[]>>(`${this.apiUrl}/get-all`);
    }

    getCustomerByGuid(customerGuid: string): Observable<ApiResponse<CustomerAccount>> {
        return this.http.get<ApiResponse<CustomerAccount>>(`${this.apiUrl}/get-by-guid/${customerGuid}`);
    }

    createCustomer(newDto: NewCustomerAccount): Observable<ApiResponse<CustomerAccount>> {
        return this.http.post<ApiResponse<CustomerAccount>>(`${this.apiUrl}/create-customer`, newDto);
    }

    updateCustomer(updateDto: UpdateCustomerAccount): Observable<ApiResponse<CustomerAccount>> {
        return this.http.put<ApiResponse<CustomerAccount>>(`${this.apiUrl}/update-customer/${updateDto.customerGuid}`, updateDto);
    }

    deleteCustomer(customerGuid: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete-customer/${customerGuid}`);
    }

    activateCustomer(customerGuid: string): Observable<ApiResponse<CustomerAccount>> {
        return this.http.put<ApiResponse<CustomerAccount>>(`${this.apiUrl}/activate-customer/${customerGuid}`, {});
    }

    toggleUserStatus(guid: string, isActive: boolean): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(
            `${this.apiUrl}/update-status/${guid}`,
            { isActive }
        );
    }

    getAllConfigurations(): Observable<ApiResponse<any[]>> {
        return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/configuration`);
    }
}