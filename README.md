# HealthPlus Backend

HealthPlus is a Node.js/Express backend for a healthcare platform that supports user authentication, doctor and patient profiles, appointment scheduling, and email-based OTP verification.

---

## Features

- **User Authentication**: Signup/login with JWT-based authentication and role-based access (patient, doctor, admin).
- **OTP Email Verification**: Secure signup with OTP sent via email.
- **Doctor & Patient Profiles**: Separate schemas and profile management for doctors and patients.
- **Appointment Scheduling**: Patients can book, modify, and cancel appointments with doctors.
- **Automatic Appointment Cleanup**: Appointments are automatically deleted 30 minutes after their scheduled time.
- **Role-Based Access Control**: Middleware to restrict access to patient/doctor/admin routes.
- **MongoDB Integration**: Uses Mongoose for schema modeling and data validation.
- **Environment Configuration**: Uses `.env` for sensitive configuration.

---

## Folder Structure
Backend/ │ ├── config/ # Database connection 
           ├── Controllers/ # Route controllers (auth, appointment, profile) 
           ├── middlewares/ # Auth and role-checking middleware 
           ├── models/ # Mongoose schemas (User, Doctor, Patient, Appointment, OTP) 
           ├── routes/ # Express route definitions 
           ├── Template/ # Email templates 
           ├── utils/ # Utility functions (MailSender) 
           ├── .env # Environment variables 
           ├── index.js # Entry point 
           └── package.json


           
---

## Getting Started

### 1. **Clone the repository**

git clone https://github.com/mdaaman77/healthplus-backend.git
cd healthplus-backend/Backend


### 2. **Install dependencies**
npm install

### 3. Configure environment variables
Create a .env file in the Backend directory:
Mentioned in .env.sample file

## API Endpoints

### 🔐 Auth

| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/api/v1/auth/send-otp`          | Send OTP to email                  |
| POST   | `/api/v1/auth/signup`            | Register as patient or doctor      |
| POST   | `/api/v1/auth/login`             | Login and receive JWT              |

---

### 🧑‍⚕️ Patient

| Method | Endpoint                                          | Description                     |
|--------|---------------------------------------------------|---------------------------------|
| GET    | `/api/v1/patient/profile`                         | Get patient profile             |
| POST   | `/api/v1/patient/profile`                         | Update patient profile          |
| POST   | `/api/v1/patient/createAppointment`               | Book appointment                |
| GET    | `/api/v1/patient/appointmentDetail/:id`           | Get appointment details         |
| DELETE | `/api/v1/patient/appointment/:id`                 | Cancel appointment              |
| POST   | `/api/v1/patient/appointment/:id`                 | Modify appointment              |
| GET    | `/api/v1/patient/all/appointments`                | List all patient appointments   |
| GET    | `/api/v1/patient/doctor/:id`                      | Get doctor profile              |

---

### 👨‍⚕️ Doctor

| Method | Endpoint                                          | Description                     |
|--------|---------------------------------------------------|---------------------------------|
| GET    | `/api/v1/doctor/profile`                          | Get doctor profile              |
| POST   | `/api/v1/doctor/profile`                          | Update doctor profile           |
| GET    | `/api/v1/doctor/appointment/:id`                 | Get appointment details         |
| DELETE | `/api/v1/doctor/appointment/:id`                 | Cancel appointment              |
| GET    | `/api/v1/doctor/all/appointments`                | List all doctor appointments    |

---

# License
This project is licensed under the MIT License.

# Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

# Contact
For questions, contact **mdaaman31241@gmail.com**.

**Replace `yourusername` and `your_email@gmail.com` with your actual GitHub username and email.**
