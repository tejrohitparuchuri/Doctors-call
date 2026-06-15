# Precision Anatomy Telemetry & Consultation Portal

Doctors' Call is a clinical telemetry array and diagnostic connection network. The platform features an interactive sub-surface anatomical scanner, a dynamic specialist matrix router, automated transaction pipelines, and active session tele-presence consultation windows.

---

## Live Demonstration

The deployed frontend interface is accessible publically at:
https://doctors--call.web.app/

---

## System Architecture Stack

### Telemetry Client Frontend
- Engine: React.js (Vite compiler build)
- Routing: React Router DOM (Single Page Application telemetry router)
- Presentation Layouts: Outlined responsive CSS variables with ambient dark glows and high-contrast red interactive matrices
- Cloud Service: Firebase JS SDK (App Core, Analytics tracker, and Realtime Database link)

### Telemetry Server Backend
- Engine: Express.js (Node.js runtime environment)
- Local Data Store: MongoDB (configured via Mongoose ODM schemas)
- Authorization: JSON Web Tokens (JWT keys) and Bcrypt credential hashing
- Seeding Protocol: Automated CSV parser importing primary medical rosters

---

## Core Operations Array

### Sub-Surface Anatomical Scanner
- High-fidelity vector maps representing skeletal framework, muscular myofibrils, and visceral organ systems.
- Interactive lens overlay with coordinate tracking lock-in.
- Focus-mapped specialization queries routing target anatomy areas to corresponding specialist sectors (e.g. Osseous tissue to Orthopedic Surgeons, Cerebral Core to Neurologists).

### Specialist Roster Matrix
- Dynamic registry index of authenticated clinical specialists.
- Multi-variable filters sorting by geographical nodes, medical specializations, consultation cost limits, and text searches.

### Transaction pipeline
- Gateway selector for Online Video Tele-Presence or In-Person Clinic consult visits.
- Fee structures factoring platform processing costs and 18% medical service tax.
- Diagnostic matrix billing invoices.

### Tele-Presence Consultation Sessions
- Active connection portals expiring exactly 48 hours post-payment authorization.
- Maximum utilization allowance of 2 active calls per session.
- Real-time digital clock display tracking session authorization decay.
- Navigation coordinate maps and directions mapping offline physical journeys.

---

## Firebase Realtime Database Telemetry Synchronization

- The application uses Firebase Realtime Database to synchronize diagnostic metadata.
- Specialist Node: All doctor data records parsed from the CSV are seeded directly into the Firebase `/doctors` database path.
- Client Profiles Node: Patient profile specifications, authorizations, and locked anatomical scan structures synchronize in real-time to `/users/{userId}`.

---

## Local Environment Deployment

### Prerequisites
- Node.js runtime environment installed.
- MongoDB database service running locally on port 27017.

### Installation

1. Download workspace project directory.
2. Launch the backend API services:
   - Navigate to backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a local .env configuration containing:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/doctors_call
     JWT_SECRET=supersecuresecretkeyshouldbechangedinproduction
     ```
   - Run Server script (automatically seeds doctor collection on startup):
     ```bash
     node server.js
     ```

3. Launch the frontend client interfaces:
   - Navigate to frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run Vite local host server:
     ```bash
     npm run dev
     ```
