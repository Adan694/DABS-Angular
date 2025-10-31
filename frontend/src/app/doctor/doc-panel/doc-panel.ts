import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { DoctorNavbar } from '../../shared/doctor-navbar/doctor-navbar';
import { AppointmentService } from '../../services/appointment';  
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket'; 
import { Subscription } from 'rxjs';
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-doc-panel',
  standalone: true,
  imports: [CommonModule, DoctorNavbar],
  templateUrl: './doc-panel.html',
  styleUrls: ['./doc-panel.css']
})
export class DocPanel implements OnInit {
  menuOpen = false;

  appointmentsCount = 0;
  patientsCount = 0;
  todayAppointments = 0;
  completedCount = 0;
  latestBookings: any[] = [];
unreadCount = 0; 
  currentDoctorId = localStorage.getItem('doctorId'); 
  private msgSub?: Subscription;
  chart: any;

  constructor(private appointmentService: AppointmentService, private router: Router,
     private socketService: SocketService
  ) {}  // ✅ Injected service

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  ngOnInit() {
    this.loadBookings();
        this.setupSocketListeners();
  }
  ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }

  setupSocketListeners() {
    this.socketService.connect();

    // ✅ Listen for messages
    this.msgSub = this.socketService.onMessage().subscribe((msg: any) => {
      // Only count messages intended for this doctor
      if (msg.receiverId === this.currentDoctorId) {
        this.unreadCount++;
      }
    });
  }


  loadBookings() {
    const doctorId = localStorage.getItem('doctorId');
    if (!doctorId) return;

    this.appointmentService.getAppointmentsForDoctor(doctorId).subscribe({
      next: (bookings) => this.processBookings(bookings || []),
      error: (err) => console.error('Failed to load bookings:', err)
    });
  }

  processBookings(bookings: any[]) {
    const today = new Date().toDateString();

    const pending = bookings.filter(b => b.status?.toLowerCase() === 'pending');
    const todayList = bookings.filter(b => new Date(b.date).toDateString() === today);
    const completedThisMonth = bookings.filter(b => {
      const d = new Date(b.date);
      const now = new Date();
      const status = b.status?.toLowerCase();
      return (status === 'complete' || status === 'completed') &&
             d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    });

    const uniquePatients = new Set(bookings.map(b => b.patientId?._id).filter(Boolean));

    this.appointmentsCount = pending.length;
    this.patientsCount = uniquePatients.size;
    this.todayAppointments = todayList.length;
    this.completedCount = completedThisMonth.length;

    this.latestBookings = pending.slice(0, 5);
    this.updateChart(bookings);
  }

  updateChart(bookings: any[]) {
    const now = new Date();
    const daysBack = 7;
    const counts: Record<string, number> = {};

    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[dateStr] = 0;
    }

    bookings.forEach(b => {
      const d = new Date(b.date);
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (counts[dateStr] !== undefined) counts[dateStr]++;
    });

    const ctx = (document.getElementById('appointmentChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Appointments',
          data: Object.values(counts),
          backgroundColor: '#4CAF50'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  goToChat() {
      this.unreadCount = 0;
    this.router.navigate(['/doctor/doctor/chat']); // adjust this path as per your routes
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
