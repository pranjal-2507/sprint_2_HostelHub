#!/bin/bash

echo -e "\n========================================="
echo "  HostelHub Development Environment"
echo -e "=========================================\n"

echo -e "[+] Starting Backend (Rust/Axum)..."
(cd backend && cargo run) &
BACKEND_PID=$!

echo -e "[+] Waiting for backend to initialize (5s)..."
sleep 5

echo -e "[+] Starting Frontend (Angular)..."
(cd frontend && npm start) &
FRONTEND_PID=$!

echo -e "\n-----------------------------------------"
echo " SERVICES STATUS:"
echo " Backend:  http://localhost:8080"
echo " Frontend: http://localhost:4200"
echo -e "-----------------------------------------\n"
echo " LOGIN CREDENTIALS:"
echo " Admin:    admin@gmail.com / @12345"
echo " Student:  student1@gmail.com / password123"
echo -e "\n=========================================\n"
echo "Press Ctrl+C to stop both services"

# Wait for user input to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait