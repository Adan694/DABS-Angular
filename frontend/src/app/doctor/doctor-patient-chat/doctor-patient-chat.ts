import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocketService } from '../../services/socket';
import { ChatService } from '../../services/chat';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-patient-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-patient-chat.html',
  styleUrls: ['./doctor-patient-chat.css']
})
export class DoctorPatientChat implements OnInit, OnDestroy {
  doctorId = '';
  patients: any[] = [];
  selectedPatientId = '';
  selectedPatientName = '';
  messages: any[] = [];
  newMessage = '';
  msgSub!: Subscription;

  constructor(
    public router: Router,
    private chatService: ChatService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.doctorId =
      localStorage.getItem('doctorId') ||
      JSON.parse(localStorage.getItem('user') || '{}')._id ||
      '';

    if (!this.doctorId) {
      alert('Doctor not logged in!');
      this.router.navigate(['/']);
      return;
    }

    // ✅ Join doctor's chat room
    this.socketService.joinChat(this.doctorId);

    // ✅ Load all patients
    this.loadPatients();

    // ✅ Listen for new incoming messages
    this.msgSub = this.socketService.onMessage().subscribe((msg) => {
      if (msg.receiverId === this.doctorId || msg.senderId === this.doctorId) {
        const p = this.patients.find(
          (x) => x._id === msg.senderId || x._id === msg.receiverId
        );

        if (p) {
          p.lastMessage = msg.message;

          // 🟢 Mark unread if not the currently opened chat
          if (msg.senderId !== this.doctorId && msg.senderId !== this.selectedPatientId) {
            p.isUnread = true;
            p.unreadCount = (p.unreadCount || 0) + 1;
            this.saveUnreadToLocalStorage(p._id, p.unreadCount);
          }
        }

        // 🪄 If currently chatting with that patient, show instantly
        if (
          this.selectedPatientId &&
          (msg.senderId === this.selectedPatientId || msg.receiverId === this.selectedPatientId)
        ) {
          this.messages.push(msg);
        }
      }
    });
  }

  ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }

  // ✅ Load patients and restore unread state from localStorage
  loadPatients() {
    this.chatService.getPatientsByDoctor(this.doctorId).subscribe({
      next: async (res: any) => {
        this.patients = Array.isArray(res) ? res : [];

        const unreadMap = this.loadUnreadFromLocalStorage();

        for (let p of this.patients) {
          this.chatService
            .getPatientDoctorMessages(p._id, this.doctorId)
            .subscribe((msgs) => {
              if (Array.isArray(msgs) && msgs.length > 0) {
                p.lastMessage = msgs[msgs.length - 1].message;
              } else {
                p.lastMessage = '';
              }

              // restore unread from localStorage
              if (unreadMap[p._id]) {
                p.isUnread = true;
                p.unreadCount = unreadMap[p._id];
              } else {
                p.isUnread = false;
                p.unreadCount = 0;
              }
            });
        }
      },
      error: (err) => console.error('Error fetching patients:', err),
    });
  }

  // ✅ When doctor opens a chat, clear unread badge and localStorage
  selectPatient(patient: any) {
    this.selectedPatientId = patient._id;
    this.selectedPatientName = patient.name;

    // clear unread
    patient.isUnread = false;
    patient.unreadCount = 0;
    this.removeUnreadFromLocalStorage(patient._id);

    this.loadMessages();
  }

  loadMessages() {
    this.chatService
      .getPatientDoctorMessages(this.selectedPatientId, this.doctorId)
      .subscribe((res: any) => {
        this.messages = Array.isArray(res) ? res : [];
      });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedPatientId) return;

    const msg = {
      senderId: this.doctorId,
      receiverId: this.selectedPatientId,
      message: this.newMessage.trim(),
    };

    this.socketService.sendMessage(msg);
    this.messages.push(msg);
    this.newMessage = '';
  }

  // -------------------------------
  // 🧠 Unread persistence utilities
  // -------------------------------
  saveUnreadToLocalStorage(patientId: string, count: number) {
    const data = this.loadUnreadFromLocalStorage();
    data[patientId] = count;
    localStorage.setItem('doctorUnreadMap', JSON.stringify(data));
  }

  loadUnreadFromLocalStorage(): Record<string, number> {
    return JSON.parse(localStorage.getItem('doctorUnreadMap') || '{}');
  }

  removeUnreadFromLocalStorage(patientId: string) {
    const data = this.loadUnreadFromLocalStorage();
    delete data[patientId];
    localStorage.setItem('doctorUnreadMap', JSON.stringify(data));
  }
}
