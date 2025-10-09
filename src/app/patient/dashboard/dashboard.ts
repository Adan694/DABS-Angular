import { Component, OnInit } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';
import { Footer } from '../components/footer/footer';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router'; // <-- import Router


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, NgbCarouselModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  showPopup = false;
  count = 0;
  constructor(private router: Router) { }
 specialities = [
  { name: 'Dermatologist', icon: 'bi-heart-pulse' },
  { name: 'Gynecologist', icon: 'bi-person-hearts' },
  { name: 'Urologist', icon: 'bi-droplet' },
  { name: 'Gastroenterologist', icon: 'bi-basket2' },
  { name: 'Dentist', icon: 'bi-braces' },
  { name: 'Obstetrician', icon: 'bi-person-check' },
  { name: 'ENT Specialist', icon: 'bi-ear' },
  { name: 'Orthopedist', icon: 'bi-bandaid' },
  { name: 'Sexologist', icon: 'bi-heart-fill' },
  { name: 'Neurologist', icon: 'bi-brain' },
  { name: 'Pediatrician', icon: 'bi-person-bounding-box' },
  { name: 'Pulmonologist', icon: 'bi-lungs' },
  { name: 'Ophthalmologist', icon: 'bi-eye' },
  { name: 'General Physician', icon: 'bi-person-vcard' },
  { name: 'Cardiologist', icon: 'bi-heart' },
  { name: 'Psychiatrist', icon: 'bi-person' },
  { name: 'Oncologist', icon: 'bi-ribbon' },
  { name: 'Nephrologist', icon: 'bi-droplet' },
  { name: 'Endocrinologist', icon: 'bi-syringe' },
  { name: 'Allergist', icon: 'bi-thermometer-half' },
  { name: 'Radiologist', icon: 'bi-x' },
  { name: 'Surgeon', icon: 'bi-scissors' },
  { name: 'Rheumatologist', icon: 'bi-hand-thumbs-up' },
  { name: 'Infectious Disease Specialist', icon: 'bi-virus' },
  { name: 'Plastic-Surgeon', icon: 'bi-emoji-smile' },
  { name: 'Hematologist', icon: 'bi-droplet-half' },
  { name: 'Geriatrician', icon: 'bi-person' },
  { name: 'Immunologist', icon: 'bi-shield' }
];


conditions = [
    { name: 'Hairfall', img: 'assets/images/hairfall.jpg', speciality: 'Dermatologist' },
    { name: 'Allergy', img: 'assets/images/allergy.jpg', speciality: 'Dermatologist' },
    { name: 'Heart Attack', img: 'assets/images/heart issue.jpg', speciality: 'Cardiologist' },
    { name: 'Fever', img: 'assets/images/Fever.jpg', speciality: 'General Physician' },
    { name: 'Breathlessness', img: 'assets/images/breathlessness.jpg', speciality: 'Pulmonologist' },
    { name: 'Diarrhea', img: 'assets/images/diareha.jpg', speciality: 'Gastroenterologist' },
    { name: 'Depression', img: 'assets/images/depression.jpg', speciality: 'Psychiatrist' },
    { name: 'High Blood Pressure', img: 'assets/images/Blood pessure.jpg', speciality: 'Cardiologist' }
];

diseases = [
    { name: 'Dengue Fever', img: 'assets/images/dengue.jpg', speciality: 'General Physician' },
    { name: 'Gastritis', img: 'assets/images/Gastiris.jpg', speciality: 'Gastroenterologist' },
    { name: 'Diabetes', img: 'assets/images/diabetes.jpg', speciality: 'Endocrinologist' },
    { name: 'Malaria', img: 'assets/images/Malaria.jpg', speciality: 'General Physician' },
    { name: 'Influenza', img: 'assets/images/Influenza.jpg', speciality: 'General Practitioner' },
    { name: 'Asthma', img: 'assets/images/Asthma.jpg', speciality: 'Pulmonologists' },
    { name: 'Migraine', img: 'assets/images/migraine.jpg', speciality: 'Neurologist' },
    { name: 'TB', img: 'assets/images/TB.jpg', speciality: 'Pulmonologist' }
];


  testimonials = [
    { name: 'John Doe', img: 'assets/images/p2.png', message: 'Excellent service! Booking was quick and easy.' },
    { name: 'Emily Clark', img: 'assets/images/p4.jpg', message: 'Booking online saved me so much time!' },
    { name: 'David Kim', img: 'assets/images/p6.jpg', message: 'The appointment system is very user-friendly.' }
  ];

  ngOnInit(): void {
    this.updateNavbar();
    this.animateWords('#heading1', 200);
    this.animateWords('#heading3', 300);
  }

  // --------------------------
  // Popup methods
  // --------------------------
  openSpecialityPopup() {
    this.showPopup = true;
    document.body.style.overflow = 'hidden';
  }

  closeSpecialityPopup() {
    this.showPopup = false;
    document.body.style.overflow = 'auto';
  }
goToSpeciality(speciality: string) {
  this.router.navigate(['/all-doctors', speciality]);
}

  // --------------------------
  // Navbar
  // --------------------------
  updateNavbar() {
    const userRole = localStorage.getItem('userRole');
    const profileMenu = document.getElementById('profileMenu');
    const authButton = document.getElementById('authButton');

    if (userRole === 'patient') {
      profileMenu?.classList.add('show');
      authButton?.classList.add('d-none');
    } else {
      profileMenu?.classList.remove('show');
      authButton?.classList.remove('d-none');
    }
  }

  // --------------------------
  // Animations
  // --------------------------
  animateWords(selector: string, delay: number = 300) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    const rawHTML = el.innerHTML.replace(/<br\s*\/?>/gi, '[[BR]]');
    const words = rawHTML.split(' ');
    el.innerHTML = '';
    let index = 0;

    words.forEach((word) => {
      if (word.includes('[[BR]]')) {
        const parts = word.split('[[BR]]');
        if (parts[0]) {
          const span = document.createElement('span');
          span.textContent = parts[0] + ' ';
          span.style.animationDelay = `${index * delay}ms`;
          el.appendChild(span);
          index++;
        }
        el.appendChild(document.createElement('br'));
        if (parts[1]) {
          const span = document.createElement('span');
          span.textContent = parts[1] + ' ';
          span.style.animationDelay = `${index * delay}ms`;
          el.appendChild(span);
          index++;
        }
      } else {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.animationDelay = `${index * delay}ms`;
        el.appendChild(span);
        index++;
      }
    });
  }
}
