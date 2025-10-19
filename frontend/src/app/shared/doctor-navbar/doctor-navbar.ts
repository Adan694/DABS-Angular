import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-doctor-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './doctor-navbar.html',
  styleUrls: ['./doctor-navbar.css']
})
export class DoctorNavbar {
  menuOpen = false;
  accountDropdownOpen = false;

toggleAccountDropdown() {
  this.accountDropdownOpen = !this.accountDropdownOpen;
}


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    localStorage.clear(); 
    window.location.href = '/login';
  }
}
