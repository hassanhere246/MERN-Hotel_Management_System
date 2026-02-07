🏨 LuxuryStay Hotel Management System
    ================================

A modern, full-stack hotel management system built with the MERN stack.  
Streamlines hotel operations, enhances guest experience, and provides an intuitive admin panel for hotel management.  
**Supports both Dark and Light mode for a comfortable user experience.**

✨ Features
   ========

  User Management
- Admin dashboard to manage roles and permissions
- Staff profiles: create, update, deactivate accounts
- Guest profiles: store personal info, preferences, and contact details

  Room Management
- Manage room inventory with types, availability, and pricing
- Book rooms, check availability, and assign rooms
- Real-time room status updates (occupied, vacant, cleaning, maintenance)

  Reservation & Check-in/out
- Online and staff-assisted bookings
- Smooth check-in and check-out procedures
- Automated room allocation and billing

  Billing & Invoicing
- Generate accurate bills for rooms and additional services
- Print or email detailed invoices

  Housekeeping & Maintenance
- Schedule cleaning tasks and mark completion
- Track maintenance requests and resolution status

  Reporting & Analytics
- Customizable dashboards for occupancy, revenue, and feedback
- Analytics for demand forecasting and pricing optimization

  Dark/Light Mode
- Seamlessly switch between **Dark Mode** and **Light Mode**
- User preference is saved and applied across sessions
- Improves accessibility and reduces eye strain

  Security & Compliance
- Secure login/logout with role-based access
- Feedback and additional guest services management

  System Administration
- Configure room rates, policies, taxes, and notifications


 🛠️ Tech Stack

  Frontend
- React: **19.2.3**  
- React Router: **7.13.0**  
- Tailwind CSS: **3.4.19**  
- Axios: **1.13.2**  
- React Icons: optional / install if needed  
- React DatePicker: optional / install if needed

  Backend
- Node.js: **v24.13.0**  
- Express.js: **5.2.1**  
- MongoDB: use local or Atlas connection  
- Mongoose: **9.1.5**  
- Express Validator: optional / install if needed  
- Bcrypt.js: **3.0.3**  
- CORS: **2.8.5**

- Deployment
- Frontend: Local development server  
- Backend: Firebase Hosting (asia-southeast1)  


 🚀 Getting Started
     ==============

  Prerequisites
- Node.js (v24 or above)  
- MongoDB (local or Atlas)  
- npm 

    nstallation
1. Clone the repository:

```bash
    git clone https://github.com/hassanhere246/MERN-Hotel_Management_System.git
    cd MERN-Hotel_Management_System

2. Install backend dependencies:

    cd backend
    npm install

3. Install frontend dependencies:

    cd ../frontend
    npm install

4. Configure Environment Variables:

   Create a .env file in the backend folder:

    MONGO_URI=your_mongodb_connection_string
    PORT=5000

5. Start the Application:

   Backend Server (Terminal 1):

    cd backend
    node server.js

Frontend Application (Terminal 2):

    cd frontend
    npm run dev

6. Access the Application:

    Frontend: http://localhost:3000
    Backend API: http://localhost:5000

📁 Project Structure

frontend/
├── src/
│   ├── assets/                 # Images, icons, static assets
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── public/
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PublicLayout.jsx
│   │   │
│   │   └── shared/
│   │       ├── ThemeToggle.jsx
│   │       ├── ProtectedRoute.jsx
│   │       └── PublicRoute.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   │
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── BillingDashboard.jsx
│   │   ├── Booking.jsx
│   │   ├── Contact.jsx
│   │   ├── GuestDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── HouseKeepingDashboard.jsx
│   │   ├── Login.jsx
│   │   ├── ManagerDashboard.jsx
│   │   ├── Register.jsx
│   │   ├── ReportsAnalytics.jsx
│   │   ├── ReservationManagement.jsx
│   │   ├── RoomManagement.jsx
│   │   ├── Rooms.jsx
│   │   ├── Settings.jsx
│   │   └── UserManagements.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── feedbackService.js
│   │   ├── houseKeepingService.js
│   │   ├── invoiceService.js
│   │   ├── reportService.js
│   │   ├── reservationService.js
│   │   ├── roomService.js
│   │   ├── serviceService.js
│   │   ├── settingService.js
│   │   └── userService.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md

🔹 BACKEND STRUCTURE

backend/
├── controllers/
│   ├── authController.js
│   ├── billingController.js
│   ├── bookingController.js
│   ├── feedbackController.js
│   ├── houseKeepingController.js
│   ├── invoiceController.js
│   ├── maintenanceController.js
│   ├── notificationController.js
│   ├── reportController.js
│   ├── roomController.js
│   ├── serviceController.js
│   ├── serviceRequestController.js
│   ├── settingsController.js
│   └── userController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
│
├── models/
│   ├── AuditLog.js
│   ├── Bill.js
│   ├── Feedback.js
│   ├── GuestProfile.js
│   ├── HousekeepingTask.js
│   ├── Invoice.js
│   ├── MaintenanceRequest.js
│   ├── Reservation.js
│   ├── Room.js
│   ├── Service.js
│   ├── ServiceRequest.js
│   ├── Settings.js
│   ├── StaffProfile.js
│   └── User.js
│
├── routes/
│   ├── authRoutes.js
│   ├── feedbackRoutes.js
│   ├── housekeepingRoutes.js
│   ├── invoiceRoutes.js
│   ├── maintenanceRoutes.js
│   ├── reportRoutes.js
│   ├── reservationRoutes.js
│   ├── roomRoutes.js
│   ├── serviceRequestRoutes.js
│   ├── serviceRoutes.js
│   ├── settingsRoutes.js
│   └── userRoutes.js
│
├── scripts/
│   ├── cleanupUsers.js
│   ├── migrate-roles.js
│   └── seedAdmin.js
│
├── uploads/
│
├── .env
├── createAdmin.js
├── debug_maintenance.js
├── fixStatus.js
├── resetDB.js
├── seed.js
├── server.js
├── test-status-update.js
├── package.json
└── package-lock.json

🔐 Authentication & Authorization

🔒 Security Overview
| 🛡️ Item            | 📌 Details                      |
| ------------------- | ------------------------------- |
| Authentication Type | JWT (JSON Web Token)            |
| Token Location      | `Authorization: Bearer <token>` |
| Token Expiry        | 1 Day                           |
| Password Security   | Bcrypt Hashing                  |
| Role Based Access   | Admin, Manager, Staff, Guest    |

📂 Authentication Files Mapping
| 📁 File             | 📍 Location    | 📝 Purpose                      |
| ------------------- | -------------- | ------------------------------- |
| `authController.js` | `controllers/` | Handles register, login, logout |
| `authRoutes.js`     | `routes/`      | Defines auth endpoints          |
| `authMiddleware.js` | `middleware/`  | Protects private routes         |
| `User.js`           | `models/`      | User authentication schema      |
| `AuditLog.js`       | `models/`      | Logs login & security actions   |

🔗 Auth API Endpoints
| 🎫 Method | 🔗 Endpoint          | 🔐 Protected | 📝 Description         |
| --------- | -------------------- | ------------ | ---------------------- |
| POST      | `/api/auth/register` | ❌ No         | Register new user      |
| POST      | `/api/auth/login`    | ❌ No         | Login & generate token |
| POST      | `/api/auth/logout`   | ✅ Yes        | Logout user            |
| GET       | `/api/auth/me`       | ✅ Yes        | Get logged-in user     |

🔄 Login & Register Flow
| 🔢 Step | ⚙️ Process                       |
| ------- | -------------------------------- |
| 1       | User submits login/register form |
| 2       | Input validation performed       |
| 3       | Password hashed / verified       |
| 4       | JWT token generated              |
| 5       | Token sent to frontend           |
| 6       | Protected routes accessed        |

👥 User Management Module
| 🧑 Role  | 🟢 Status   | 🧠 Description      |
| -------- | ----------- | ------------------- |
| Admin    | Approved    | Full system control |
| Manager  | Approved    | Hotel operations    |
| Staff    | Approved    | Limited access      |
| Guest    | Pending     | Requires approval   |
| Any User | Deactivated | Login blocked       |

📂 User Management Files
| 📁 File             | 📍 Location    | 📝 Purpose                  |
| ------------------- | -------------- | --------------------------- |
| `userController.js` | `controllers/` | User CRUD & status handling |
| `userRoutes.js`     | `routes/`      | User endpoints              |
| `User.js`           | `models/`      | Core user schema            |
| `GuestProfile.js`   | `models/`      | Guest-specific info         |
| `StaffProfile.js`   | `models/`      | Staff/admin profile         |
| `AuditLog.js`       | `models/`      | Tracks user actions         |

🔗 User Management APIs
| 🎫 Method | 🔗 Endpoint             | 🧠 Function         |
| --------- | ----------------------- | ------------------- |
| GET       | `/api/users`            | Fetch all users     |
| POST      | `/api/users`            | Create user (admin) |
| PUT       | `/api/users/:id`        | Update user         |
| DELETE    | `/api/users/:id`        | Deactivate user     |
| PUT       | `/api/users/:id/status` | Approve / Reject    |

🔍 User Lifecycle Card
| 🔄 Phase     | 📝 Description             |
| ------------ | -------------------------- |
| Registration | Guest self-registers       |
| Pending      | Waiting for admin approval |
| Approved     | Full access enabled        |
| Active Use   | System usage               |
| Deactivated  | Access blocked             |


📸 Screenshots





















  
