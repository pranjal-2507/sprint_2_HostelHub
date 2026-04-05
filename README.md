# HostelHub

A professional, role-based hostel management system designed for efficiency and security. Built with a robust **Rust (Axum)** backend and a dynamic **Angular** frontend.

## Key Features

### Admin Oversight
- **Dashboard Analytics**: Real-time tracking of occupancy, payments, and complaints.
- **Resource Management**: Complete CRUD operations for rooms and student records.
- **Financial Tracking**: Automated fee generation and status monitoring.
- **System Communications**: Centralized notice board management.
  <img width="1100" height="791" alt="image" src="https://github.com/user-attachments/assets/53934b55-94b1-4293-902f-45ca0745dd8e" />


### Hosteler Experience
- **Personalized Dashboard**: Instant access to room details and payment status.
- **Digital Payments**: Comprehensive fee history and pending dues tracking.
- **Issue Reporting**: Integrated complaint system with status tracking.
- **Live Announcements**: Real-time critical notices from administration.
  <img width="1916" height="867" alt="image" src="https://github.com/user-attachments/assets/bd27fdc3-b225-4c01-bc16-54c889bd3392" />


## Technology Stack

- **Backend**: Rust (Axum), PostgreSQL (SQLx), JWT Authentication.
- **Frontend**: Angular 17+, Angular Material, RxJS.
- **Security**: Argon2 Hashing, JWT-based RBAC (Role-Based Access Control).

## Getting Started

### Prerequisites
- Rust (Stable)
- Node.js (v18+)
- PostgreSQL

### Quick Start
The project includes automated scripts to start both services simultaneously:

- **Windows**: Run `start-dev.bat`
- **Linux/macOS**: Run `bash start-dev.sh`

### Manual Setup

1. **Backend**:
   ```bash
   cd backend
   # Configure .env with your DATABASE_URL
   cargo run
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```
