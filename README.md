# HostelHub

A full-fledged hostel management system.

## Project Structure

This repository contains two main parts:
- **frontend**: The Angular web application.
- **backend**: The Rust (Actix + SQLx) backend service.

## Getting Started

### Frontend

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
ng serve
```
Access the application at `http://localhost:4200/`.

### Backend

Navigate to the `backend` directory:
Make sure you have a valid PostgreSQL `.env` setup.

```bash
cd backend
cargo run
```
