import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForgetPasswordComponent } from '../forget-password/forget-password.component';
import { ROUTES } from '../core/constants/routes.constant';
import { getToken, Messaging } from '@angular/fire/messaging';
import envs from '../../envs';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading: boolean;

  routes = ROUTES;

  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly messaging = inject(Messaging);
  fcmToken: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly toast: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.isLoading = false;
  }

  ngOnInit(): void {
    // navigator.serviceWorker.getRegistration().then((registration) => {
    //   if (registration) {
    //     // console.log('Existing service worker found:', registration);
    //   } else {
    //     console.log('No active service worker found.');
    //   }
    // });
    // this.requestPermission();
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  login() {
    this.isLoading = true;
    // const permission = await Notification.requestPermission();

    // if (permission !== 'granted') {
    //   this.toast.error('Please allow notification permission');
    //   this.isLoading = false;
    //   return;
    // }
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password, this.fcmToken).subscribe({
        next: (response) => {
          this.toast.success((response as any).message);
          localStorage.setItem('token', (response as any).data.token);
          this.router.navigate([this.routes.POSTS]);
        },
        error: (err) => {
          this.toast.error(err.error.message || 'Something went wrong!');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      this.isLoading = false;
      this.loginForm.markAllAsTouched();
    }
  }

  openForgetPasswordModel() {
    const modalRef = this.modalService.open(ForgetPasswordComponent);
  }

  // async requestPermission() {
  //   try {
  //     const registration = await navigator.serviceWorker.ready;
  //     const permission = await Notification.requestPermission();
  //     console.log('Notification permission:', permission);

  //     if (permission !== 'granted') {
  //       console.warn('Notification permission denied!');
  //       return;
  //     }

  //     const token = await getToken(this.messaging, {
  //       vapidKey: envs.vapidKey,
  //       serviceWorkerRegistration: registration,
  //     });

  //     if (token) {
  //       this.fcmToken = token;
  //       this.auth.setFcmToken(token);
  //     } else {
  //       console.log('No registration token available.');
  //     }
  //   } catch (error) {
  //     console.error('Error getting token:', error);
  //   }
  // }
}
