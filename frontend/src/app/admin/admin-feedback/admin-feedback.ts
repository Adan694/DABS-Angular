import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AdminService } from '../../services/admin';
import { ChangeDetectorRef } from '@angular/core';
import { ConfirmModal } from '../confirm-modal/confirm-modal';


@Component({
  selector: 'app-admin-feedback',
  imports: [CommonModule, FormsModule, AdminSidebar, ConfirmModal],
  templateUrl: './admin-feedback.html',
  styleUrls: ['./admin-feedback.css']
})
export class AdminFeedback implements OnInit {
  feedbackList: any[] = [];
  paginatedFeedback: any[] = [];
  sidebarActive = false;
  currentPage = 1;
  itemsPerPage = 5;
  Math = Math;
  showDeleteModal = false;
  feedbackToDelete: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
    private adminService: AdminService,
    private cd: ChangeDetectorRef,

  ) {}

  ngOnInit() {
    console.log('[AdminFeedback] ngOnInit() called');
    this.fetchAllFeedback();
  }

  fetchAllFeedback() {
    console.log('[AdminFeedback] fetchAllFeedback() called');

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('[AdminFeedback] No auth token found — redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });
    console.log('[AdminFeedback] Sending GET request to /api/feedback/admin/all');

    this.adminService.getAllFeedback().subscribe({
      next: (data) => {
        console.log('[AdminFeedback] Feedback data received:', data);

        if (!Array.isArray(data)) {
          console.error('[AdminFeedback] Invalid response format:', data);
          return;
        }

        this.feedbackList = data
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((fb) => ({
            ...fb,
            stars: this.createStarHtml(fb.rating)
          }));

        console.log(`[AdminFeedback] Total feedback items: ${this.feedbackList.length}`);
        this.updatePaginatedFeedback();
      },
      error: (err) => {
        console.error('[AdminFeedback] Error fetching feedback:', err);
        alert('Failed to load feedback. Check console for details.');
      }
    });
  }

  createStarHtml(rating: number): SafeHtml {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars +=
        i <= rating
          ? '<i class="fa-solid fa-star" style="color:#ff9800"></i>'
          : '<i class="fa-regular fa-star" style="color:#ccc"></i>';
    }
    return this.sanitizer.bypassSecurityTrustHtml(stars);
  }

  updatePaginatedFeedback() {
    console.log(`[AdminFeedback] Updating paginated feedback (page ${this.currentPage})`);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFeedback = this.feedbackList.slice(startIndex, endIndex);
    console.log(`[AdminFeedback] Showing ${this.paginatedFeedback.length} items`);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.feedbackList.length) {
      this.currentPage++;
      console.log('[AdminFeedback] Next page:', this.currentPage);
      this.updatePaginatedFeedback();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log('[AdminFeedback] Previous page:', this.currentPage);
      this.updatePaginatedFeedback();
    }
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
    console.log('[AdminFeedback] Sidebar toggled:', this.sidebarActive);
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('active', this.sidebarActive);
      overlay.classList.toggle('active', this.sidebarActive);
    }
  }

  logout() {
    console.log('[AdminFeedback] Logging out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }



  openDeleteModal(id: string) {
  console.log('[AdminFeedback] openDeleteModal called for ID:', id);
  this.feedbackToDelete = id;
  this.showDeleteModal = true;
  console.log('[AdminFeedback] showDeleteModal set to true');
}

closeDeleteModal() {
  console.log('[AdminFeedback] closeDeleteModal called');
  this.showDeleteModal = false;
  this.feedbackToDelete = null;
  console.log('[AdminFeedback] showDeleteModal set to false');
}

confirmDelete() {
  console.log('[AdminFeedback] confirmDelete called for ID:', this.feedbackToDelete);
  if (!this.feedbackToDelete) return;
  this.deleteFeedback(this.feedbackToDelete);
  this.closeDeleteModal();
}


  deleteFeedback(id: string) {
    console.log('[AdminFeedback] Delete feedback called for ID:', id);
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: 'Bearer ' + token });

this.adminService.deleteFeedback(this.feedbackToDelete!).subscribe({      next: () => {
        console.log('[AdminFeedback] Feedback deleted successfully');
        alert('Feedback deleted successfully.');
        this.fetchAllFeedback();
      },
      error: (err) => {
        console.error('[AdminFeedback] Error deleting feedback:', err);
        alert('Error deleting feedback. Please try again.');
      }
    });
  }

  goToPatient(patientId: string) {
    console.log('[AdminFeedback] Navigating to patient:', patientId);
    this.router.navigate(['/admin/patient-list'], { queryParams: { highlight: patientId } });
  }

  formatDateTime(ts: string): string {
    const d = new Date(ts);
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} ${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${
      d.getHours() >= 12 ? 'PM' : 'AM'
    }`;
    return formatted;
  }
}
