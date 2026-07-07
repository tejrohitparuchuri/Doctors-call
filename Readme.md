# Precision Anatomy Telemetry & Consultation Portal (Doctors' Call)

Welcome to the Doctors' Call repository! This is a production-grade, full-stack clinical telemetry array and diagnostic connection network built using the MERN stack (MongoDB, Express.js, React, Node.js) featuring an interactive sub-surface anatomical body scanner and automated specialist matrix routing.

---



### 🔑 Pre-seeded Test Accounts

All accounts use the default passwords listed below:

1. **Administrator Account** (System administration, doctor approvals, and roster management):
   * **Email**: `admin@doctor.com`
   * **Password**: `123456`

2. **Clinical Specialist Account** (Consultation session management, client requests, and patient tracking):
   * **Technical/Specialty Doctor**: `doctor.doc0001@aesculapius.med` (or any valid doctor ID up to `doctor.doc1000@aesculapius.med`)
   * **Password**: `doctorpassword123`

3. **Patient Account** (Body scanning, specialist filtering, booking consultations, and active session tele-presence):
   * *(You can register a new patient account directly on the sign-up page)*

---

## ✨ Advanced Interactive Features

Recently, we've implemented several premium features to significantly improve user experience and clinical visibility:

1. **Sub-Surface Anatomical Scanner**: High-fidelity vector maps representing skeletal framework, muscular myofibrils, and visceral organ systems. Features an interactive lens overlay with coordinate tracking lock-in, plus focus-mapped specialization queries routing target anatomy areas to corresponding specialist sectors (e.g., Osseous tissue to Orthopedic Surgeons, Cerebral Core to Neurologists).
2. **Dynamic Specialist Roster Matrix**: A registry index of authenticated clinical specialists with multi-variable filters sorting by geographical nodes, medical specializations, consultation cost limits, and text searches.
3. **Automated Transaction Pipeline**: Integrated checkout with options for Online Video Tele-Presence or In-Person Clinic consult visits, calculating fee structures that factor in platform processing costs and 18% medical service tax.
4. **Tele-Presence Consultation Sessions**: Active connection portals expiring exactly 48 hours post-payment authorization. Supports a maximum utilization allowance of 2 active calls per session, real-time digital clock display tracking session authorization decay, and navigation coordinate maps for offline physical journeys.
5. **Modern Glow Aesthetic**: Clean dark-mode user interface designed with responsive CSS variables, ambient glows, and high-contrast red interactive matrices.

---

## 📂 Project Architecture & Schemas

The application is structured around a multi-model database design linking patients, clinical specialists, appointments, and telemetry details:

* **Users Schema** - Handles role management (`patient`, `doctor`, `admin`), profile details (age, gender, blood group, health condition, insurance ID), saved anatomical parts, notification arrays, and credentials.
* **Doctors Schema** - Contains detailed professional profiles (specialty, cost, experience, hospital affiliation, rating, clinic location/place) linked to their primary user accounts.
* **Appointments Schema** - Manages the lifecycles of consultation appointments (status tracking: `pending`, `approved`, `confirmed`, `cancelled`), payment details, consultation types (`online` or `offline`), decay timestamps (`expiresAt`), active calls remaining, and uploaded medical documents.

---

## 🛠️ Repository Layout

The repository is structured as a decoupled monorepo:

* [frontend/](file:///t:/desk/Projects/Doctors%20call/frontend): SPA client application built with React, Vite, and styled with responsive CSS variables featuring ambient dark glows and high-contrast red interactive matrices.
* [backend/](file:///t:/desk/Projects/Doctors%20call/backend): Node.js/Express.js backend REST API, utilizing Mongoose models to interact with MongoDB.

---

## 🚀 How to Run Locally

Follow these steps to configure and execute the application on your local machine:

### 1. Configure Environment Variables

#### Backend Server Configurations
Create a `.env` file inside the [backend/](file:///t:/desk/Projects/Doctors%20call/backend) directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doctors_call
JWT_SECRET=supersecuresecretkeyshouldbechangedinproduction
```

---

### 2. Quick Setup & Run (Manual Execution)

Since backend and frontend are decoupled, run the client and server processes in separate terminal instances:

#### To start the backend API:
```bash
cd backend
npm install
node server.js   # Runs the server (automatically seeds the doctor collection from CSV on startup)
```

#### To start the frontend React app:
```bash
cd frontend
npm install
npm run dev
```
* Frontend Client will launch on: [http://localhost:5173](http://localhost:5173)
* Backend API Server will run on: [http://localhost:5000](http://localhost:5000)
