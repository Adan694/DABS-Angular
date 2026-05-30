# Doctor Appointment Booking System

A full-stack web application for managing doctor appointments, patient records, doctor availability, feedback, and real-time chat. Built with Angular, Node.js, Express, and MongoDB.

## Features

### Authentication & Authorization
- Patient signup and login with JWT authentication
- Doctor login with role-based access
- Admin login with full system access
- OTP verification via email for account verification
- Forgot password and reset password functionality
- Account deactivation and activation by admin

### Patient Management
- Patient registration with unique email, phone, and CNIC validation
- View and update patient profile
- Admin can view all patients
- Admin can view individual patient details
- Admin can view all appointments of a specific patient
- Admin can deactivate or activate patient accounts
- Admin can delete patient accounts with automatic cancellation of all appointments
- Automatic patient blocking after 5 missed appointments (3-day block)

### Doctor Management
- Admin can add new doctors with photo upload
- View all doctors with details (speciality, degree, experience, about)
- View individual doctor profile with availability and feedback
- Admin can update doctor information
- Admin can delete doctors with automatic cancellation of all appointments
- Doctors can update their own profile
- Doctors can change password with current password verification

### Appointment Booking
- Patients can book appointments with available doctors
- Automatic token generation for each appointment (3-digit unique token per doctor per day)
- Automatic patient number generation (format: [patientId-last4]-[sequence])
- Prevents double booking of same time slot
- Prevents patient from booking multiple appointments at same time
- Limits patient to 5 appointments per day
- Slot availability check before booking
- Email notifications for booking confirmation
- In-app notifications for booking confirmation

### Appointment Management
- View patient's own appointments
- View doctor's appointments
- Admin can view all appointments
- Cancel appointment with 30-minute window for slot restoration
- Reschedule appointment by admin or doctor
- Update appointment status (pending, completed, cancelled, missed)
- Mark appointments as completed with automatic patient notification
- Automatic missed appointment tracking

### Doctor Availability
- Doctors can add availability slots (date and time)
- Update and delete availability slots
- Reorder availability slots display
- Toggle doctor availability status (available/unavailable)
- Past availability slots automatically filtered out
- Booked slots automatically removed from availability

### Feedback System
- Patients can submit feedback with rating (1-5) and comment for completed appointments
- View feedback for specific doctor
- Patients can edit their own feedback
- Patients can delete their own feedback
- Admin can delete any feedback
- Automatic average rating calculation for doctors
- Admin receives notification on new feedback

### Real-time Chat
- Send messages between patients and doctors
- View chat history between users
- Get chat list with unread message count
- Messages sorted chronologically

### Admin Dashboard
- View total users count
- View patient and doctor counts separately
- View today's appointments list
- View total feedback alerts count
- View latest 5 bookings
- View total appointments count
- Time series charts data for patients (last 7 days)
- Time series charts data for doctors (last 7 days)
- Time series charts data for appointments (last 7 days)

### Notifications
- Email notifications for:
  - OTP verification
  - Appointment booking
  - Appointment cancellation
  - Appointment reschedule
  - Appointment completion
  - Missed appointment warning (4 missed appointments)
  - Account block notification (5 missed appointments)
  - Account deletion notification
- In-app notifications via Notification model
- Real-time socket notifications for chat and updates

### Security
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (patient, doctor, admin)
- Environment variables for sensitive data
- Account blocking mechanism for missed appointments
- Deactivated account prevention from login

## Tech Stack

Frontend: Angular, TypeScript, HTML, CSS, Bootstrap
Backend: Node.js, Express.js
Database: MongoDB, Mongoose
Authentication: JWT, bcrypt
Email Service: Nodemailer
Real-time Communication: Socket.io
File Upload: Multer

## API Endpoints

### Auth Routes
POST /api/auth/signup - Patient registration
POST /api/auth/login - User login
POST /api/auth/request-otp - Request OTP for verification
POST /api/auth/verify-otp - Verify OTP
POST /api/auth/forgot-password - Request password reset OTP
POST /api/auth/reset-password - Reset password

### Patient Routes
GET /api/patient/profile - Get patient profile
PUT /api/patient/profile - Update patient profile

### Doctor Routes
GET /api/doctors - Get all doctors
GET /api/doctors/:id - Get doctor by ID
PUT /api/doctors/:id - Update doctor profile
PUT /api/doctors/:id/availability - Update availability
GET /api/doctors/:id/availability - Get availability
DELETE /api/doctors/:id/availability/:date - Delete availability slot
PUT /api/doctors/:id/availability-order - Reorder availability slots
PUT /api/doctors/:id/available - Toggle doctor availability

### Admin Routes
GET /api/admin/profile/:id - Get admin profile
GET /api/admin/current-profile - Get current admin profile
GET /api/admin/patients - Get all patients
GET /api/admin/patients/:id - Get patient by ID
GET /api/admin/patients/:id/appointments - Get patient appointments
DELETE /api/admin/patients/:id - Delete patient
PUT /api/admin/patients/:id/deactivate - Deactivate patient
PUT /api/admin/patients/:id/activate - Activate patient
GET /api/admin/stats/total-users - Get total users count
GET /api/admin/stats/user-counts - Get patient and doctor counts
GET /api/admin/stats/todays-appointments - Get today's appointments
GET /api/admin/stats/feedback-alerts - Get feedback count
GET /api/admin/stats/latest-bookings - Get latest 5 bookings
GET /api/admin/stats/total-appointments - Get total appointments count
GET /api/admin/stats/patients-timeseries - Patient registration trend
GET /api/admin/stats/doctors-timeseries - Doctor registration trend
GET /api/admin/stats/appointments-timeseries - Appointment booking trend
POST /api/admin/doctors - Add new doctor
DELETE /api/admin/doctors/:id - Delete doctor

### Appointment Routes
POST /api/appointments/book - Book appointment
DELETE /api/appointments/:id/cancel - Cancel appointment
PUT /api/appointments/:id/reschedule - Reschedule appointment
GET /api/appointments/patient/:patientId - Get patient bookings
GET /api/appointments/doctor/:doctorId - Get doctor appointments
PUT /api/appointments/:id/status - Update appointment status
GET /api/appointments/doctor/:doctorId/all - Get all doctor appointments
GET /api/appointments - Get all appointments (admin)
GET /api/appointments/:id - Get single appointment
DELETE /api/appointments/:id - Delete appointment

### Feedback Routes
POST /api/feedback/submit - Submit feedback
GET /api/feedback/doctor/:doctorId - Get feedback by doctor
PUT /api/feedback/:id - Update feedback
DELETE /api/feedback/:id - Delete feedback
GET /api/feedback - Get all feedback (admin)
GET /api/feedback/patient/:patientId - Get feedback by patient

### Chat Routes
POST /api/chat/send - Send message
GET /api/chat/messages/:userId/:contactId - Get messages between users
GET /api/chat/list/:userId - Get chat list with unread count

## Database Models

User Model - Stores patients and admins with fields: name, email, password, phone, cnic, role, isActive, isBlocked, blockedUntil, missedAppointments, otp, otpExpiration

Doctor Model - Stores doctors with fields: name, email, password, speciality, degree, experience, about, photo, available, availabilitySlots, averageRating, feedbackCount, role

Booking Model - Stores appointments with fields: patientId, doctorId, patientNumber, token, date, time, name, phone, email, age, issue, status, rescheduledBy, feedback

Feedback Model - Stores feedback with fields: doctorId, appointmentId, patientId, userName, rating, comment

Chat Model - Stores messages with fields: senderId, receiverId, message, read

Notification Model - Stores in-app notifications with fields: userId, message, isRead

## Installation

Prerequisites: Node.js (v14 or higher), MongoDB (local or Atlas), Angular CLI

Clone the repository:
git clone https://github.com/Adan694/DABS-Angular.git
cd DABS-Angular

Install backend dependencies:
cd backend
npm install

Install frontend dependencies:
cd ../frontend
npm install

Create a .env file in the backend folder with the following variables:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doctor_appointment
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

Run the application:
Backend: cd backend && npm run dev
Frontend: cd frontend && ng serve

Open your browser at http://localhost:4200

## Author

Amna Shehzad

GitHub: https://github.com/Adan694
LinkedIn: https://linkedin.com/in/amna-shehzad-373bba361
Email: ashehzad0100@gmail.com
