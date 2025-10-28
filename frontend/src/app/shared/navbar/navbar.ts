import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  menuActive = false;
  dropdownActive = false;
  isLoggedIn = false;

constructor(
  private router: Router,
  private socketService: SocketService  
) {}

  ngOnInit() {
    this.checkLoginStatus();

    // Close dropdown if click outside
    document.addEventListener('click', () => {
      this.dropdownActive = false;
    });
  }

  checkLoginStatus(): void {
    const role = localStorage.getItem('userRole');
    this.isLoggedIn = role === 'patient';
  }

  togglemenu(): void {
    this.menuActive = !this.menuActive;
  }

  closeMenu(): void {
    this.menuActive = false;
    this.dropdownActive = false;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownActive = !this.dropdownActive;
  }

  logout(): void {
    this.socketService.disconnect();

    localStorage.clear();
    this.isLoggedIn = false;
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
