import { Component } from '@angular/core';

@Component({
  selector: 'app-success',
  imports: [],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss',
})
export class SuccessComponent {
  timeLeft: number = 20;
  interval: any;

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 1) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        window.close();
      }
    }, 1000);
  }
}
