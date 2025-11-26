import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { API_URL } from '../config/api.config';
import { LoginResponse } from '../models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  protected baseUrl = inject(API_URL);
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('synUser');
    const hasToken = !!localStorage.getItem('synToken');

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(hasToken);
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(accountcode: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/account/login`, {
      accountcode,
      password
    }).pipe(
      tap(response => {
        //console.log('Login response:', response);
      }),
      map(response => {
        if (response && response.token) {
          localStorage.setItem('synToken', response.token);
          localStorage.setItem('synUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        } else {
          console.error('No token in response!');
        }
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('synToken');
    localStorage.removeItem('synUser');
    localStorage.removeItem('rememberedEmail');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false); 

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('synToken');
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.baseUrl}/auth/refresh`, {
      refreshToken
    }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('synToken', response.token);
        }
      })
    );
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/register`, userData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/reset-password`, {
      token,
      newPassword
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/account/verify-email`, { token });
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return now >= expiry;
    } catch (e) {
      return true;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}