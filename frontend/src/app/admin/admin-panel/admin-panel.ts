import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
import { AdminService } from '../../services/admin';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, AdminSidebar],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanel implements OnInit, AfterViewInit {
  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Admins only.");
  this.router.navigate(['/login']);
      return;
    }
    this.fetchDashboardStats();
    this.fetchTodaysAppointments();
    setTimeout(() => this.renderCharts(), 500);
  }

  ngAfterViewInit(): void {
    const bar = document.getElementById("bar") as HTMLElement;
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    const overlay = document.getElementById("overlay") as HTMLElement;

    bar?.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });

    overlay?.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
  this.router.navigate(['/login']);
    });
  }

  fetchDashboardStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        (document.getElementById("admittedPatientsCount") as HTMLElement).textContent =
          data.patientCount || 0;
        (document.getElementById("totalDoctorsCount") as HTMLElement).textContent =
          data.doctorCount || 0;
      },
      error: (err) => console.error(err)
    });
  }

  fetchTodaysAppointments() {
    this.adminService.getTodaysAppointments().subscribe({
      next: (data) => {
        const appointments = Array.isArray(data.todaysAppointments) ? data.todaysAppointments : [];
        const container = document.getElementById("todaysAppointmentsList")!;
        container.innerHTML = "";

        appointments.forEach((app: any) => {
          const div = document.createElement("div");
          div.className = "appointment-item";

          const infoDiv = document.createElement("div");
          infoDiv.className = "appointment-info";
          const nameDiv = document.createElement("div");
          nameDiv.className = "name";
          nameDiv.textContent = app.patientName;
          const detailsDiv = document.createElement("div");
          detailsDiv.className = "details";
          detailsDiv.textContent = `With Dr. ${app.doctorName}`;
          infoDiv.appendChild(nameDiv);
          infoDiv.appendChild(detailsDiv);

          const timeDiv = document.createElement("div");
          timeDiv.className = "appointment-time";
          timeDiv.textContent = app.time;

          const statusDiv = document.createElement("div");
          statusDiv.className = `appointment-status status-${(app.status || "unknown").toLowerCase()}`;
          statusDiv.textContent = app.status || "Unknown";

          div.appendChild(infoDiv);
          div.appendChild(timeDiv);
          div.appendChild(statusDiv);
          container.appendChild(div);
        });
      },
      error: (err) => console.error(err)
    });
  }

  renderCharts() {
    const patientsCtx = (document.getElementById("patientsChart") as HTMLCanvasElement)?.getContext("2d");
    const appointmentsCtx = (document.getElementById("appointmentsChart") as HTMLCanvasElement)?.getContext("2d");
    const doctorsCtx = (document.getElementById("doctorsChart") as HTMLCanvasElement)?.getContext("2d");

    // Fetch all three charts in parallel
    this.adminService.getPatientsTimeSeries().subscribe({
      next: (patientsData) => this.adminService.getAppointmentsTimeSeries().subscribe({
        next: (appointmentsData) => this.adminService.getDoctorsTimeSeries().subscribe({
          next: (doctorsData) => this.createCharts(patientsData, appointmentsData, doctorsData, patientsCtx, appointmentsCtx, doctorsCtx)
        })
      })
    });
  }

  private createCharts(patientsData: any, appointmentsData: any, doctorsData: any,
    patientsCtx: CanvasRenderingContext2D | null,
    appointmentsCtx: CanvasRenderingContext2D | null,
    doctorsCtx: CanvasRenderingContext2D | null) {

    const processTimeSeriesData = (data: any[]) => {
      const labels: string[] = [];
      const counts: number[] = [];
      const dateMap = new Map();
      data.forEach((item) => dateMap.set(item._id, item.count));
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        labels.push(dateStr);
        counts.push(dateMap.get(dateStr) || 0);
      }
      return { labels, counts };
    };

    const patientsProcessed = processTimeSeriesData(patientsData);
    const appointmentsProcessed = processTimeSeriesData(appointmentsData);
    const doctorsProcessed = processTimeSeriesData(doctorsData);

    if (patientsCtx) new Chart(patientsCtx, { type: "bar", data: { labels: patientsProcessed.labels, datasets: [{ label: "Patients", data: patientsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" }] } });
    if (appointmentsCtx) new Chart(appointmentsCtx, { type: "bar", data: { labels: appointmentsProcessed.labels, datasets: [{ label: "Appointments", data: appointmentsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" }] } });
    if (doctorsCtx) new Chart(doctorsCtx, { type: "bar", data: { labels: doctorsProcessed.labels, datasets: [{ label: "Doctors", data: doctorsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" }] } });
  }
}
