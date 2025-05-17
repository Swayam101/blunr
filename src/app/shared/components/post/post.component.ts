import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ROUTES } from '../../../core/constants/routes.constant';
import { ReportPostComponent } from '../../../report-post/report-post.component';
import { PaymentPageComponent } from '../payment-page/payment-page.component';
import { SubscriptionType } from '../../../core/constants/common.constant';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog/confirmation-dialog.service';
import { PostService } from '../../../core/services/post/post.service';
import { ToastrService } from 'ngx-toastr';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-post',
  imports: [NgTemplateOutlet, CommonModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  @Input() postData!: any;

  routes = ROUTES;
  postId: string = '';
  isPostLike: boolean = false;
  isFree = false;
  caption = '';
  isMultiOrSingle = 0;
  creatorName = '';
  creatorHandle = '';
  uploadedAt = '';
  creatorId: string = '';
  likesCount = 0;
  userName = '';
  avatar = '../../../../../../assets/images/avatar.jpeg';
  isReportable: boolean = true;
  isSubscribed: boolean = false;

  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);

  constructor(
    private readonly authService: AuthService,
    private readonly confirmationService: ConfirmationDialogService,
    private readonly postService: PostService,
    private readonly toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.caption = this.postData?.caption;
    this.isFree = !this.postData?.isLocked;
    this.isSubscribed = this.postData.isSubscribed;
    this.isMultiOrSingle = this.postData?.media.length;
    this.creatorName = this.postData?.creator?.name ?? 'Blunr Creator';
    this.creatorHandle = this.postData?.creator?.username;
    this.uploadedAt = this.timeAgo(this.postData?.createdAt);
    this.creatorId = this.postData?.creator?._id;
    this.likesCount = this.postData?.likes.length;
    this.isPostLike = this.postData?.isLikedByUser;
    this.avatar = this.postData?.creator?.avatar ?? '../../../../../../assets/images/avatar.jpeg';
    const currentUser = this.authService.getUserData();
    this.postId = this.postData._id;
    const id = currentUser._id;
    if (this.creatorId === id) this.isReportable = false;
    else this.isReportable = true;
  }

  clickOnLikeButton() {
    this.isPostLike = !this.isPostLike;
    if (this.isPostLike) {
      this.likesCount = this.postData?.likes.length + 1;
    } else {
      this.likesCount = this.postData?.likes.length === 0 ? 0 : this.postData?.likes.length - 1;
    }
    this.postService.likePost(this.postId).subscribe({
      next: (repsonse) => {
        this.likesCount = (repsonse as any).likesCount;
      },
    });
  }

  redirectToProfile(profileId: string) {
    const currentPath = window.location.pathname;

    if (currentPath.includes('/profile/')) {
      window.scrollTo(0, 0);
    }

    const redirection = [ROUTES.PROFILE];
    const currentUserRedirected = this.authService.getUserData().username === profileId;
    if (!currentUserRedirected) redirection.push(profileId);
    this.router.navigate(redirection);
  }

  openSendTipModel(recipientId: string) {
    const modalRef = this.modalService.open(PaymentPageComponent);
    modalRef.componentInstance.type = SubscriptionType.TIP;
    modalRef.componentInstance.name = SubscriptionType.TIP;
    modalRef.componentInstance.recipientId = recipientId;
    modalRef.componentInstance.currentPageUrl = this.router.url;
  }

  openReportModal() {
    const reportModalRef = this.modalService.open(ReportPostComponent);
    reportModalRef.componentInstance.reportedPostId = this.postData._id;
    reportModalRef.componentInstance.creatorName = this.postData.creator.name ?? 'Blunr Creator';
    reportModalRef.componentInstance.creatorUsername =
      this.postData.creator.username ?? 'Blunr Creator';
    reportModalRef.componentInstance.creatorProfile =
      this.postData.creator.avatar ?? '../../../../assets/images/avatar.jpeg';
  }

  openDeleteModal() {
    this.confirmationService
      .confirm('Delete Post', 'Are you sure you want to delete this post ?')
      .then((confirmed) => {
        if (confirmed)
          this.postService.deletePost(this.postId).subscribe({
            next: (repsonse) => {
              this.toast.success((repsonse as any).message);
            },
          });
      });
  }

  getMediaType(url: string): 'image' | 'video' | 'unknown' {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const extension = pathname.split('.').pop()?.toLowerCase();

      if (extension) {
        if (imageExtensions.includes(extension)) {
          return 'image';
        } else if (videoExtensions.includes(extension)) {
          return 'video';
        }
      }
    } catch (error) {
      console.error('Invalid URL:', url);
    }

    return 'unknown';
  }

  timeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return `yesterday`;
    }

    return `${diffInDays} days ago`;
  }

  openPaymentPage(postId: string, recipientId: string) {
    if (!this.isSubscribed) {
      return this.redirectToProfile(this.creatorHandle);
    }
    const modalRef = this.modalService.open(PaymentPageComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.type = SubscriptionType.POST;
    modalRef.componentInstance.name = SubscriptionType.POST;
    modalRef.componentInstance.amount = this.postData?.price;
    modalRef.componentInstance.postId = postId;
    modalRef.componentInstance.recipientId = recipientId;
    modalRef.componentInstance.currentPageUrl = this.router.url;
  }
}
