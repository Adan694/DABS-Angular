import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket';
import { ChatService } from '../../services/chat';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-doctor-chat.html',
  styleUrls: ['./patient-doctor-chat.css']
})
export class PatientDoctorChat implements OnInit, OnDestroy {
  doctorId = '';
  patientId = '';
  messages: any[] = [];
  newMessage = '';
  msgSub!: Subscription;
  doctorName = ''; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService,
  ) {}

  ngOnInit() {
  this.doctorId = this.route.snapshot.paramMap.get('doctorId') || '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.patientId = user._id || '';

  const navigation = this.router.getCurrentNavigation();
  this.doctorName =navigation?.extras?.state?.['doctorName']
 || 'Doctor';

  if (!this.doctorId || !this.patientId) {
    alert('Missing doctor or patient info!');
    this.router.navigate(['/']);
    return;
  }

  this.socketService.joinChat(this.patientId);
  this.socketService.joinChat(this.doctorId);

  this.loadMessages();

  this.msgSub = this.socketService.onMessage().subscribe((msg) => {
    if (
      (msg.senderId === this.doctorId && msg.receiverId === this.patientId) ||
      (msg.senderId === this.patientId && msg.receiverId === this.doctorId)
    ) {
      this.messages.push(msg);
    }
  });
}


  ngOnDestroy() {
    this.msgSub?.unsubscribe();
  }
  goBack() {
  this.router.navigate(['/patient/appointments']);
}


  loadMessages() {
    this.chatService
      .getPatientDoctorMessages(this.patientId, this.doctorId)
      .subscribe((res) => {
        this.messages = res;
      });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const msg = {
      senderId: this.patientId,
      receiverId: this.doctorId,
      message: this.newMessage.trim(),
    };

    this.socketService.sendMessage(msg);
    this.messages.push({ ...msg, pending: true });
    this.newMessage = '';
  }
}

