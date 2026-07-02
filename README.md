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

## 👨‍💻 My Role in the Project
In this team-based graduation project, I was directly responsible for **System Architecture & Backend API Engineering (Go)**. My primary focus was designing the database schema, constructing the RESTful routing layer, implementing the core algorithmic math engines (including the Grace-Mark loop), and ensuring strict architectural security through JWT and Bcrypt integration.

## 📸 Screenshots
*(Note: Upload screenshots of the Admin Dashboard, Grading Sheet, and Student Transcript to an `assets` folder and link them here)*
*   [Admin Control Panel Dashboard]
*   [Spreadsheet-Style Grading Sheet]
*   [Student Transcript View]

## ⚙️ How to Run Locally

### Backend (Go/Gin)
1. Clone the repository: `git clone https://github.com/MostafaMaher/NCT-Student-Information-System.git`
2. Navigate to the backend directory: `cd backend`
3. Configure your MySQL connection strings in the environment file.
4. Run the Go server: `go run main.go` (Runs on port 8080)

### Frontend (React)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start` (Runs on port 3000)
