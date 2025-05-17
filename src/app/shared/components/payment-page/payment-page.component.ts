import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { PaymentService } from '../../../core/services/payment/payment.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscriptionType } from '../../../core/constants/common.constant';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROUTES } from '../../../core/constants/routes.constant';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-page',
  imports: [ReactiveFormsModule],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent implements OnInit {
  isLoading = false;
  subscriptionType = SubscriptionType;
  @Input() type: string = '';
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() amount: string = '';
  @Input() currency: string = 'USD';
  @Input() postId: string | null = null;
  @Input() subscriptionId: string | null = null;
  @Input() messageId: string | null = null;
  @Input() recipientId: string | null = null;
  @Input() currentPageUrl: string = '';
  success_url: string = '';
  cancel_url: string = '';

  paymentForm!: FormGroup;
  isEditable: boolean = false;

  @Output() paymentNotificationWindowClosed = new EventEmitter<boolean>(false);

  private readonly paymentService = inject(PaymentService);
  private readonly activeModal = inject(NgbActiveModal);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastrService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.isEditable = this.type === this.subscriptionType.TIP;

    this.paymentForm = this.fb.group({
      amount: [this.amount, [Validators.required, Validators.min(0.01)]],
      note: [''],
    });

    this.success_url = `${window.location.origin}${ROUTES.SUCCESS}`;
    this.cancel_url = `${window.location.origin}${ROUTES.FAILED}`;

    if (!this.isEditable) {
      this.paymentForm.get('amount')?.disable();
    }
  }

  payNow() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData = {
      type: this.type,
      name: this.name,
      description: this.paymentForm.get('note')?.value || 'Test Transaction',
      amount: this.paymentForm.get('amount')?.value,
      currency: this.currency,
      redirect_url: this.success_url,
      cancel_url: this.cancel_url,
      postId: this.postId,
      subscriptionId: this.subscriptionId,
      messageId: this.messageId,
      recipientId: this.recipientId,
    };

    console.info('payment form data  : ', formData);

    this.paymentService.createCharge(formData).subscribe({
      next: (response) => {
        if (response?.charge?.data?.hosted_url) {
          const paymentWindow = window.open(response?.charge?.data?.hosted_url, '_blank');

          if (paymentWindow) {
            const interval = setInterval(() => {
              if (paymentWindow.closed) {
                clearInterval(interval);
                this.handlePaymentWindowClose();
              }
            }, 500);
          }
          // Mock for testing
          // setTimeout(() => {
          //   if (paymentWindow) {
          //     paymentWindow.location.href = this.success_url;
          //   }
          // }, 1000);
        } else {
          this.toast.error('Failed to create payment');
        }
        this.isLoading = false;
      },
      error: () => {},
    });
  }

  closePaymentModel() {
    this.activeModal.dismiss();
  }

  handlePaymentWindowClose() {
    this.paymentNotificationWindowClosed.emit(true);
    this.activeModal.dismiss();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([this.currentPageUrl]);
    });
  }
}
