import { Component, inject } from '@angular/core';
import { HomePageAreaComponent } from '../shared/components/home-page-area/home-page-area.component';
import { HomeSidebarComponent } from '../shared/components/home-sidebar/home-sidebar.component';
import { ChatbotComponent } from '../shared/components/chatbot/chatbot.component';
import { NgTemplateOutlet } from '@angular/common';
import { ChatService } from '../core/services/chat/chat.service';
import { AuthService } from '../core/services/auth/auth.service';
import { EmptyDataComponent } from '../shared/components/empty-data/empty-data.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTES } from '../core/constants/routes.constant';
import { ChatSelectionService } from '../shared/components/chatbot/chat-selection.service';

@Component({
  selector: 'app-message',
  imports: [
    HomePageAreaComponent,
    HomeSidebarComponent,
    ChatbotComponent,
    NgTemplateOutlet,
    EmptyDataComponent,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  isChatisOpened: boolean = false;
  userChatRooms: any[] = [];
  role = 'creator';

  router = inject(Router);

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly chatSelectionService: ChatSelectionService,
    private readonly route: ActivatedRoute
  ) {}

  openChatOfUser(chatId: string) {
    this.isChatisOpened = true;
    this.router.navigate([ROUTES.INBOX, chatId]);
  }

  goChatBack() {
    this.isChatisOpened = false;
  }
  formatDate(date: string) {
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
    return formattedDate;
  }

  ngOnInit() {
    this.authService.user$.subscribe((userData) => {
      this.role = userData.role;
    });
    this.chatSelectionService.isChatSelected$.subscribe((value) => {
      this.isChatisOpened = value ?? false;
    });
    this.route.paramMap.subscribe((params) => {
      const currentRoomId = params.get('chatRoomId');
      if (currentRoomId) this.chatSelectionService.setChatState(true);
      else this.chatSelectionService.setChatState(false);
    });

    this.loadUserChatRooms();
  }

  loadUserChatRooms() {
    this.chatService.getUserChatRooms().subscribe({
      next: (data) => {
        this.userChatRooms = data as any[];
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
      },
    });
  }
}
