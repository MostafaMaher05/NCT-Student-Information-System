# 🎓 NCT Student Information System (NCT-SIS)

## 📌 Overview
NCT-SIS is a comprehensive, decoupled full-stack web application designed to digitalize and streamline university control rooms, student records, and complex grading matrices. Developed as a graduation project, the system replaces prone-to-error manual academic operations with an automated, high-performance software infrastructure.

## 🛠️ Tech Stack & Architecture
*   **Frontend:** React.js (Single Page Application, State Management, Local Storage Drafting)
*   **Backend:** Go / Golang (Gin-Gonic Framework, High-Concurrency RESTful API)
*   **Database:** MySQL (Relational schema enforced via GORM)
*   **Security:** Stateless JWT Authentication, Bcrypt Cryptographic Hashing, Strict CORS Policies

## 🚀 Key Features & Engineering Highlights

### 1. High-Performance API & Query Optimization
*   Engineered a rapid backend using Go and Gin.
*   Successfully resolved the common **$N+1$ Query Problem** utilizing GORM's Eager Preloading to fetch nested course assignments in a single O(1) query pass.

### 2. Automated Grading Matrix & Grace-Mark Algorithm (R)
*   Encoded strict university bylaws directly into the backend handlers.
*   The algorithm dynamically calculates passing thresholds and automatically injects up to 5 "Grace Marks" for students on the boundary line of failing, mitigating human error completely.

### 3. Spreadsheet-Style Interactive Grid
*   Developed an Excel-like editable grid component in React.
*   Features real-time client-side calculation matrices to eliminate synchronization lag.
*   Implemented a local browser buffer (`localStorage`) serialization to safeguard drafted grades against unexpected network disconnections.

### 4. Dynamic Course Architect 
*   Administrators can construct dynamic courses, allocating total absolute ceilings (100 or 150 marks) and distributing weights across exams and sub-assignments with strict validation.

### 5. Multi-Role Security & Data Integrity
*   Isolated workflows for System Administrators, Control Staff, and Students.
*   Dual-factor identity matching for students (Academic Code + 14-Digit National ID) with regex evaluations.
*   High-compliance UTF-8 CSV data export engine embedded with a BOM for flawless Excel archival.

## 👨‍💻 Engineering & Leadership
**Team Leader & Full-Stack Architect:** Mostafa Maher

This system was fully architected and developed from the ground up as a comprehensive full-stack graduation project. I led the project and was responsible for the complete end-to-end engineering lifecycle, including:
*   **Backend Engineering:** Built the high-performance Go/Gin API engine, encompassing the automated grading algorithms and Grace-Mark injection logic.
*   **Frontend Development:** Coded the interactive React.js SPA, featuring real-time calculation matrices, state encapsulation, and custom data grids.
*   **Database Architecture:** Designed the MySQL relational schemas and implemented optimized GORM queries to eliminate $N+1$ bottlenecks.
*   **System Security:** Enforced strict JWT stateless authentication, Bcrypt hashing protocols, and CORS middleware policies.

## 📸 System Interface & Screenshots

### 🚪 1. Gateway & Authentication
The system features strict dual-factor validation and isolated portals for staff and students.

<p align="center">
  <img width="32%" alt="Start Page" src="https://github.com/user-attachments/assets/85cbaefa-6cf7-45ef-add1-e61fea1d2797" />
  <img width="32%" alt="Staff Login" src="https://github.com/user-attachments/assets/f9490a45-8daf-4214-9e07-9f0faa219510" />
  <img width="32%" alt="Student Login" src="https://github.com/user-attachments/assets/efa0fe04-5849-4188-be83-aff6d39e071f" />
</p>

### ⚙️ 2. Administrator Portal (System Configuration)
A dedicated cockpit for system superusers to manage registries and configure dynamic course parameters.

<p align="center">
  <img width="32%" alt="Admin Dashboard" src="https://github.com/user-attachments/assets/28b7bdef-40e1-4ea8-b1e6-ada02adc72ec" />
  <img width="32%" alt="Student Registry" src="https://github.com/user-attachments/assets/b1bf13da-b945-4b51-9a19-f8b1e5ee1db0" />
  <img width="32%" alt="Create Courses" src="https://github.com/user-attachments/assets/54268556-1e27-4821-957d-371531fa67ab" />
</p>

### 📊 3. Control Room Portal (Academic Grading)
The core operational matrix featuring real-time client-side spreadsheet calculations and algorithm-driven Grace-Mark injections.

<p align="center">
  <img width="32%" alt="Control Dashboard" src="https://github.com/user-attachments/assets/8e6d706e-2650-44b2-8749-619fca9f5244" />
  <img width="32%" alt="Active Courses" src="https://github.com/user-attachments/assets/dde53eea-cc09-42f9-b0d4-8536a808a4c1" />
  <img width="32%" alt="Grades Sheet" src="https://github.com/user-attachments/assets/2dec52db-c5bc-4d8c-889d-85d2a264b1a4" />
</p>

### 🎓 4. Student Portal (Dashboards & Transcripts)
A secure, read-only performance tracking environment providing instant access to grades and schedules.

<p align="center">
  <img width="32%" alt="Student Dashboard" src="https://github.com/user-attachments/assets/79e844a1-24f8-4096-8368-822064f595a5" />
  <img width="32%" alt="Student Grades" src="https://github.com/user-attachments/assets/6b70aa7c-cc02-4f9c-be40-d90eb1b8b853" />
  <img width="32%" alt="Academic Schedule" src="https://github.com/user-attachments/assets/b2982323-6755-4b2d-a88c-2ff8d9a19206" />
</p>

## ⚙️ How to Run Locally

### Backend (Go/Gin)
1. Clone the repository: `git clone https://github.com/MostafaMaher05/NCT-Student-Information-System.git`
2. Navigate to the backend directory: `cd backend`
3. Configure your MySQL connection strings in the environment file.
4. Run the Go server: `go run main.go` (Runs on port 8080)

### Frontend (React)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start` (Runs on port 3000)
