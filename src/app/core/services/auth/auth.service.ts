import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { ROUTES } from '../../constants/routes.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<any>(null);
  fcmToken: string = '';
  user$ = this.userSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toast: ToastrService
  ) {}

  getUserData() {
    return this.userSubject.value;
  }
  setUserData(userData: any) {
    this.userSubject.next(userData);
  }

  setFcmToken(token: string) {
    this.fcmToken = token;
  }

  updateUserProfile(formData: FormData) {
    return this.http.put('/user/update', formData);
  }

  signup(email: string, password: string, username: string, role: string) {
    const res = this.http.post(`/auth/register`, {
      email,
      password,
      role,
      username,
    });
    return res;
  }

  login(email: string, password: string, fcmToken: string) {
    const res = this.http.post(`/auth/login`, {
      email,
      password,
      fcmToken,
    });
    return res;
  }

  getProfile(): Observable<any> {
    return this.http.get('/user/getProfile').pipe(
      map((user) => {
        this.userSubject.next((user as any).data.user);
        return user;
      }),
      catchError((err) => {
        const errorMsg = err.error.message;
        this.toast.error(errorMsg);
        return this.router.navigate([ROUTES.LOGIN]);
      })
    );
  }
  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  logout() {
    this.userSubject.next(null);
    localStorage.removeItem('token');
    this.router.navigate([ROUTES.LOGIN]);
  }
}
