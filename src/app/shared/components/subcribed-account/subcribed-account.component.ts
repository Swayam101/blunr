import { Component, inject, Input, OnInit } from '@angular/core';
import { ROUTES } from '../../../core/constants/routes.constant';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentPageComponent } from '../payment-page/payment-page.component';
import { SubscriptionType } from '../../../core/constants/common.constant';
import { ChatService } from '../../../core/services/chat/chat.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ChatSelectionService } from '../chatbot/chat-selection.service';

@Component({
  selector: 'app-subcribed-account',
  imports: [],
  templateUrl: './subcribed-account.component.html',
  styleUrl: './subcribed-account.component.scss',
})
export class SubcribedAccountComponent implements OnInit {
  routes = ROUTES;

  router = inject(Router);

  @Input() creatorData!: {
    _id: string;
    username: string;
    subscriptionPrice: string;
    name: string;
    avatar: string;
  };

  _id = 'xyz';
  username = 'Blunr User';
  subscriptionPrice = '0';
  name = 'Blunr User';
  avatar = '../../../../../../assets/images/avatar.jpeg';

  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    this._id = this.creatorData._id;
    this.username = this.creatorData.username;
    this.subscriptionPrice = this.creatorData.subscriptionPrice;
    this.name = this.creatorData.name;
    this.avatar = this.creatorData.avatar;
  }

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly toast: ToastrService,
    private readonly chatSelectionService: ChatSelectionService
  ) {}

  openSendTipModel() {
    const modalRef = this.modalService.open(PaymentPageComponent);

    modalRef.componentInstance.type = SubscriptionType.TIP;
    modalRef.componentInstance.name = SubscriptionType.TIP;
    modalRef.componentInstance.currentPageUrl = this.router.url;
  }

  redirectChatRoom() {
    const currentUserId = this.authService.getUserData()._id;
    this.chatService
      .createChatRoom({ members: [this._id, currentUserId], admin: this._id })
      .subscribe({
        next: (response) => {
          this.toast.success('chat room creation successful');
          this.router.navigate(['/inbox', (response as any)._id]);
        },
        error: (err) => {
          console.log('print chat room error ', err);
        },
      });
  }
}
