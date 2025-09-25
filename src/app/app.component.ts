import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';       // ✅ import here
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FeedbackService } from './feedback.service';

@Component({
  selector: 'app-root',
  standalone: true,                         // ✅ standalone
  imports: [FormsModule, HttpClientModule, CommonModule],  // ✅ add modules here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']      // comment if file not present
})
export class AppComponent {
  username: string = '';
  note: string = '';

  constructor(private feedbackService: FeedbackService) {}

  submitFeedback() {
    const feedback = { username: this.username, note: this.note };
    this.feedbackService.submitFeedback(feedback).subscribe({
      next: () => {
        alert('✅ Feedback submitted successfully!');
        this.username = '';
        this.note = '';
      },
      error: (err) => {
        console.error(err);
        alert('❌ Failed to submit feedback');
      }
    });
  }
}
