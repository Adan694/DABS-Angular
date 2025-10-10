import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.html',
  styleUrls: ['./faqs.css'],
  imports: [CommonModule]
})
export class Faqs {
  menuActive = false;
  showAppointments = false; 

  faqs = [
    {
      question: 'How do I know if my appointment is confirmed?',
      answer: 'After booking, you will see your appointment listed in your dashboard and receive a confirmation email.',
      open: false
    },
    {
      question: 'Can I leave feedback for a doctor?',
      answer: 'Yes, after your appointment, you can leave feedback and a rating for your doctor.',
      open: false
    },
    {
      question: 'What if I need to cancel my appointment?',
      answer: 'You can cancel your appointment anytime through your account on our website.',
      open: false
    },
    {
      question: 'Do I need to create an account to book an appointment?',
      answer: 'Yes, an account helps manage your appointments and receive notifications.',
      open: false
    },
    {
      question: 'What should I bring to my appointment?',
      answer: 'Please bring a valid ID, insurance info, and relevant medical records.',
      open: false
    },
    {
      question: 'What happens if I miss my appointments?',
      answer: 'If you miss 4 appointments, you get a warning. On the 5th, your account is blocked for 3 days.',
      open: false
    },
    {
      question: 'How can I book an appointment?',
      answer: 'Login, choose a doctor, select date & time, and confirm your booking.',
      open: false
    }
  ];

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  toggleFAQ(faq: any) {
    faq.open = !faq.open;
  }
}
