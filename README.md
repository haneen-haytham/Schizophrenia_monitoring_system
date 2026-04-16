# Schizophrenia_monitoring_system


A full-stack IoT-based system that monitors schizophrenic patients using ESP32 and processes the data using a backend API.

## Features

- Collects real-time sensor data from ESP32
- Processes data using a custom algorithm
- Stores data in MongoDB
- Displays patient data in a dashboard with charts
- Detects abnormal conditions and triggers alerts

## Tech Stack

- Backend: Node.js, Express
- Database: MongoDB
- Hardware: ESP32 + MPU6050 + Max30102
- Frontend: React (Vite)

##  System Architecture

ESP32 → Backend API → MongoDB → Frontend Dashboard

##  API Endpoints

- POST /api/patient
- POST /api/data
- GET /api/patient/:id/data
- GET /api/patient/:id/latest

## Setup

### Backend
`bash
cd backend
npm install
npm start
### Frontend
cd frontend
npm install
npm start
