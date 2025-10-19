import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; 
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,       
  imports: [
    RouterOutlet,
    Navbar,
    Footer,
    HttpClientModule,
    FormsModule, 
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class App {
  protected readonly title = signal('DABS-Frontend');
}
