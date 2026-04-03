# BloodNet

BloodNet is a full-stack blood donation and request management platform that connects donors, patients (requesters), and administrators. It helps users discover eligible donors, post urgent blood requests, track request responses, and manage blood inventory.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [API Examples](#api-examples)
- [Business Rules](#business-rules)
- [Security and Access Control](#security-and-access-control)
- [Operational Notes](#operational-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

## Overview

BloodNet provides:

- Role-based user management for donor, requester, and admin accounts
- Donor search by blood group and area (upazila)
- Blood request creation and donor response workflow
- Request status lifecycle (Pending, Accepted, Fulfilled, Cancelled)
- Notification center for request and response events
- Admin dashboard with platform stats, user management, request management, and blood inventory

## Core Features

### Donor Features

- Register donor profile with blood group, date of birth, and gender
- Toggle donation availability
- Enforced donation eligibility checks based on last donation date
- View request alerts and respond (Accept or Decline)
- Donation history tracking and donor activity metrics

### Requester (Patient) Features

- Create blood requests with urgency levels
- Track all submitted requests in dashboard
- Update request status (Fulfilled or Cancelled)
- Receive notifications when donors respond

### Admin Features

- View global dashboard analytics (donors, requests, emergency stats)
- Activate or deactivate users
- Update any request status
- Manage blood inventory (add, list, update)
- Secure admin bootstrap script for initial admin creation/promotion

## Tech Stack

### Frontend

- React 19
- React Router 7
- Axios
- React Toastify
- Vite

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- CORS
- express-rate-limit

## Project Structure

```text
BloodNet/
├─ client/                 # React application
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ utils/
│  └─ .env.example
├─ server/                 # Express API
│  ├─ controllers/
│  ├─ middleware/
│  ├─ models/
│  ├─ routes/
│  ├─ scripts/
│  └─ .env.example
└─ README.md
```

## Architecture

- Frontend consumes backend REST APIs via Axios instance at `client/src/utils/api.js`
- JWT token is stored in local storage and sent as `Authorization: Bearer <token>`
- Protected backend routes use auth middleware (`protect`)
- Admin-only endpoints use both `protect` and `adminOnly`
- Backend uses MongoDB models for users, donors, blood requests, notifications, and inventory

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or cloud)

### 1) Clone and install dependencies

```bash
git clone <your-repository-url>
cd BloodNet

cd server && npm install
cd ../client && npm install
```

### 2) Configure environment variables

Create env files from examples:

- `server/.env` from `server/.env.example`
- `client/.env` from `client/.env.example`

### 3) Run the backend

```bash
cd server
npm run dev
```

### 4) Run the frontend

```bash
cd client
npm run dev
```

### 5) Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | API server port | `5000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/bloodnet` |
| `JWT_SECRET` | Yes | Secret key for JWT signing | `replace_with_strong_secret` |
| `CLIENT_URL` | No | Allowed frontend origin for CORS | `http://localhost:5173` |

### Client (`client/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL for API requests | `http://localhost:5000/api` |

## Available Scripts

### Server

```bash
npm run start         # run production server
npm run dev           # run with nodemon
npm run seed:admin    # bootstrap or promote an admin user
```

Example admin seed command:

```bash
npm run seed:admin -- --confirm make-admin --email admin@example.com --password StrongPass123 --name "System Admin" --phone 01700000000 --upazila "Sylhet Sadar"
```

### Client

```bash
npm run dev           # run Vite dev server
npm run build         # production build
npm run preview       # preview production build
npm run lint          # ESLint check
```

## API Overview

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register user (donor/requester/admin by role input) |
| `POST` | `/auth/login` | Public | Login and receive JWT |
| `GET` | `/auth/me` | Protected | Get logged-in user profile |

### Donors

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/donors/search` | Public | Search available donors by query |
| `GET` | `/donors/:id` | Public | Get donor details by ID |
| `POST` | `/donors/profile` | Protected | Create donor profile |
| `GET` | `/donors/profile/me` | Protected | Get own donor profile |
| `PUT` | `/donors/profile/update` | Protected | Update donor profile |
| `PUT` | `/donors/toggle-availability` | Protected | Toggle donor availability |
| `POST` | `/donors/add-donation` | Protected | Add donation record |

### Blood Requests and Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/requests` | Public | List blood requests |
| `GET` | `/requests/:id` | Public | Get request details |
| `POST` | `/requests` | Protected | Create blood request |
| `GET` | `/requests/my/requests` | Protected | List own requests |
| `PUT` | `/requests/:id/respond` | Protected (Donor flow) | Respond to request |
| `PUT` | `/requests/:id/status` | Protected (Requester flow) | Update own request status |
| `GET` | `/requests/notifications/my` | Protected | Get current user notifications |
| `PUT` | `/requests/notifications/read` | Protected | Mark notifications as read |

### Admin

All `/admin/*` routes require admin role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/stats` | Platform dashboard stats |
| `GET` | `/admin/users` | List users |
| `PUT` | `/admin/users/:id/toggle` | Activate/deactivate user |
| `GET` | `/admin/requests` | List all blood requests |
| `PUT` | `/admin/requests/:id/status` | Update any request status |
| `GET` | `/admin/inventory` | List inventory |
| `POST` | `/admin/inventory` | Add inventory item |
| `PUT` | `/admin/inventory/:id` | Update inventory units/status |

## API Examples

These examples assume:

- Base URL is `http://localhost:5000/api`
- You already have a valid JWT token from login

### 1) Register a donor

Request:

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "password": "StrongPass123",
  "phone": "01700111222",
  "role": "donor",
  "bloodGroup": "A+",
  "upazila": "Sylhet Sadar",
  "dateOfBirth": "1998-04-12",
  "gender": "Male"
}
```

Sample response:

```json
{
  "message": "Registration successful!",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "67f0c6b4e5c4d08f6746b1aa",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "role": "donor",
    "bloodGroup": "A+",
    "upazila": "Sylhet Sadar",
    "isAvailable": true
  }
}
```

### 2) Login

Request:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "rahim@example.com",
  "password": "StrongPass123"
}
```

Sample response:

```json
{
  "message": "Login successful!",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "67f0c6b4e5c4d08f6746b1aa",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "role": "donor",
    "bloodGroup": "A+",
    "upazila": "Sylhet Sadar",
    "isAvailable": true
  }
}
```

### 3) Create a blood request (requester)

Request:

```http
POST /requests
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "patientName": "Fatema Begum",
  "bloodGroup": "A+",
  "unitsNeeded": 2,
  "hospital": "MAG Osmani Medical College Hospital",
  "upazila": "Sylhet Sadar",
  "urgencyLevel": "Emergency",
  "contactNumber": "01700999888",
  "additionalNotes": "Needed before surgery"
}
```

Sample response:

```json
{
  "message": "Blood request created successfully!",
  "bloodRequest": {
    "_id": "67f0c7f4e5c4d08f6746b25f",
    "patientName": "Fatema Begum",
    "bloodGroup": "A+",
    "status": "Pending"
  },
  "matchingDonorsFound": 4,
  "alertsSent": 4
}
```

### 4) Donor responds to a request

Request:

```http
PUT /requests/67f0c7f4e5c4d08f6746b25f/respond
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "response": "Accepted"
}
```

Sample response:

```json
{
  "message": "You have Accepted this blood request",
  "bloodRequest": {
    "_id": "67f0c7f4e5c4d08f6746b25f",
    "status": "Accepted"
  }
}
```

### 5) Mark request as fulfilled (requester)

Request:

```http
PUT /requests/67f0c7f4e5c4d08f6746b25f/status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "Fulfilled"
}
```

Sample response:

```json
{
  "message": "Request marked as Fulfilled",
  "bloodRequest": {
    "_id": "67f0c7f4e5c4d08f6746b25f",
    "status": "Fulfilled"
  }
}
```

### 6) Get my notifications

Request:

```http
GET /requests/notifications/my
Authorization: Bearer <JWT_TOKEN>
```

Sample response:

```json
{
  "unreadCount": 2,
  "notifications": [
    {
      "_id": "67f0c95ae5c4d08f6746b2ef",
      "type": "request_accepted",
      "title": "A donor accepted your request!",
      "isRead": false,
      "createdAt": "2026-04-03T10:31:21.000Z"
    }
  ]
}
```

### 7) Admin adds inventory

Request:

```http
POST /admin/inventory
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "hospital": "MAG Osmani Medical College Hospital",
  "upazila": "Sylhet Sadar",
  "bloodGroup": "O-",
  "units": 8,
  "expiryDate": "2026-05-15"
}
```

Sample response:

```json
{
  "message": "Inventory added successfully!",
  "inventory": {
    "_id": "67f0ca71e5c4d08f6746b379",
    "hospital": "MAG Osmani Medical College Hospital",
    "bloodGroup": "O-",
    "units": 8,
    "status": "Available"
  }
}
```

## Business Rules

- Donor registration requires blood group, date of birth, and gender
- Donor visibility in search depends on availability
- Donor response options: Accepted or Declined
- Request status options: Pending, Accepted, Fulfilled, Cancelled
- Donation history is automatically recorded when a request becomes Fulfilled after donor acceptance
- Authentication endpoints are rate-limited to reduce brute-force attempts

## Security and Access Control

- Passwords are hashed using bcrypt
- JWT-based authentication with protected middleware
- Role-based route enforcement for admin and dashboard pages
- CORS restricted by `CLIENT_URL`
- Server startup fails fast if required env vars are missing

## Operational Notes

- The frontend uses route-based role redirects:
  - donor -> `/dashboard/donor`
  - requester -> `/dashboard/patient`
  - admin -> `/admin`
- Keep `JWT_SECRET` strong and private in production
- Set production values for `CLIENT_URL`, `VITE_API_URL`, and `MONGO_URI`

## Troubleshooting

### MongoDB connection failed

- Verify `MONGO_URI` in `server/.env`
- Ensure MongoDB is running and reachable

### Unauthorized / token failed

- Confirm token exists in local storage
- Re-login to refresh token
- Verify backend `JWT_SECRET` is unchanged for active sessions

### CORS errors in browser

- Ensure `CLIENT_URL` in server env matches frontend origin
- Ensure `VITE_API_URL` points to correct backend base URL

### Admin login not working

- Use admin seed script with `--confirm make-admin`
- Optionally verify credentials with:

```bash
node scripts/checkAdminLogin.js --email admin@example.com --password StrongPass123
```

## Roadmap

- Add test suite (unit + integration)
- Add pagination for heavy list endpoints
- Improve input validation with schema-based validators
- Add deployment manifests and CI pipeline
- Add audit logs and activity timeline for admin actions

---

If you use this project for production, harden all secrets, add centralized logging, and enforce HTTPS at the reverse proxy level.
