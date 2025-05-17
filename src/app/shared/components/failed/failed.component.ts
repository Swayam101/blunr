import { Component } from '@angular/core';

@Component({
  selector: 'app-failed',
  imports: [],
  templateUrl: './failed.component.html',
  styleUrl: './failed.component.scss',
})
export class FailedComponent {
  timeLeft: number = 10;
  interval: any;

  ngOnInit(): void {
    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.interval);
        window.close();
      }
    }, 1000);
  }
}
