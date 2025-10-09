import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // <-- Import here

@Component({
  selector: 'app-root',
  standalone: true,       // <-- Must declare standalone component
  imports: [
    RouterOutlet,
    HttpClientModule       // <-- Add HttpClientModule here
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // <-- fix typo: styleUrls (plural)
})
export class App {
  protected readonly title = signal('DABS-Frontend');
}
