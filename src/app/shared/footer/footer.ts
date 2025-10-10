import { Component, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
   isPopupVisible = false;

  constructor(private renderer: Renderer2) {}

  openPopup() {
    this.isPopupVisible = true;
    this.renderer.addClass(document.body, 'no-scroll'); // disable scroll
  }

  closePopup() {
    this.isPopupVisible = false;
    this.renderer.removeClass(document.body, 'no-scroll'); // re-enable scroll
  }
}
