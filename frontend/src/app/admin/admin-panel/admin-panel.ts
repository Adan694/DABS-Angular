
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, AdminSidebar],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.css']
})
export class AdminPanel implements OnInit, AfterViewInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "login.html";
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
      window.location.href = "login.html";
    });
  }

  async fetchDashboardStats() {
    const token = localStorage.getItem("authToken");
    try {
      const countsRes = await fetch(
        "http://localhost:3000/api/admin/dashboard/user-counts",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const countsData = await countsRes.json();
      (document.getElementById("admittedPatientsCount") as HTMLElement).textContent =
        countsData.patientCount || 0;
      (document.getElementById("totalDoctorsCount") as HTMLElement).textContent =
        countsData.doctorCount || 0;

      const appointmentsRes = await fetch(
        "http://localhost:3000/api/admin/dashboard/todays-appointments",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const appointmentsData = await appointmentsRes.json();
      console.log("Appointments Data:", appointmentsData);

      (document.getElementById("appointmentsCount") as HTMLElement).textContent =
        appointmentsData.todaysAppointments?.length || 0;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  }

  async fetchTodaysAppointments() {
    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        "http://localhost:3000/api/admin/dashboard/todays-appointments",
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const data = await res.json();
      console.log("Appointments Data:", data);

      const appointments = Array.isArray(data.todaysAppointments)
        ? data.todaysAppointments
        : [];
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
        statusDiv.className = `appointment-status status-${(
          app.status || "unknown"
        ).toLowerCase()}`;
        statusDiv.textContent = app.status || "Unknown";

        div.appendChild(infoDiv);
        div.appendChild(timeDiv);
        div.appendChild(statusDiv);

        container.appendChild(div);
      });
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
    }
  }

  async renderCharts() {
    const token = localStorage.getItem("authToken");
    const patientsCtx = (document.getElementById("patientsChart") as HTMLCanvasElement)?.getContext("2d");
    const appointmentsCtx = (document.getElementById("appointmentsChart") as HTMLCanvasElement)?.getContext("2d");
    const doctorsCtx = (document.getElementById("doctorsChart") as HTMLCanvasElement)?.getContext("2d");

    try {
      const [patientsRes, appointmentsRes, doctorsRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/dashboard/patients-time-series", {
          headers: { Authorization: "Bearer " + token },
        }),
        fetch("http://localhost:3000/api/admin/dashboard/appointments-time-series", {
          headers: { Authorization: "Bearer " + token },
        }),
        fetch("http://localhost:3000/api/admin/dashboard/doctors-time-series", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      const patientsData = await patientsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const doctorsData = await doctorsRes.json();

      function processTimeSeriesData(data: any[]) {
        const labels: string[] = [];
        const counts: number[] = [];
        const dateMap = new Map();
        data.forEach((item) => {
          dateMap.set(item._id, item.count);
        });
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          labels.push(dateStr);
          counts.push(dateMap.get(dateStr) || 0);
        }
        return { labels, counts };
      }

      const patientsProcessed = processTimeSeriesData(patientsData);
      const appointmentsProcessed = processTimeSeriesData(appointmentsData);
      const doctorsProcessed = processTimeSeriesData(doctorsData);

      // @ts-ignore
      new Chart(patientsCtx, {
        type: "bar",
        data: {
          labels: patientsProcessed.labels,
          datasets: [
            { label: "Patients", data: patientsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" },
          ],
        },
      });

      // @ts-ignore
      new Chart(appointmentsCtx, {
        type: "bar",
        data: {
          labels: appointmentsProcessed.labels,
          datasets: [
            { label: "Appointments", data: appointmentsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" },
          ],
        },
      });

      // @ts-ignore
      new Chart(doctorsCtx, {
        type: "bar",
        data: {
          labels: doctorsProcessed.labels,
          datasets: [
            { label: "Doctors", data: doctorsProcessed.counts, backgroundColor: "rgb(9, 102, 102)" },
          ],
        },
      });
    } catch (error) {
      console.error("Error rendering charts:", error);
    }
  }
}
