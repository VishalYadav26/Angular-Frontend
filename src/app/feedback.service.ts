import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:5000/api/feedback';

  constructor(private http: HttpClient) {}

  submitFeedback(feedback: { username: string; note: string }): Observable<any> {
    return this.http.post(this.apiUrl, feedback);
  }
}
