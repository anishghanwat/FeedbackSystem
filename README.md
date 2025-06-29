# Lightweight Feedback System

A full-stack web application for sharing internal feedback between managers and employees. Built with React frontend and FastAPI backend.

## 🚀 Features

### Authentication & User Management
- **User Registration** - Create new accounts with email verification
- **Secure Login** - JWT token-based authentication
- **Profile Management** - Update personal information and change passwords
- **Account Deletion** - Permanently delete user accounts
- **Role-based Access Control** - Manager/Employee permissions
- **Session Management** - localStorage-based session persistence

### Manager Features
- Dashboard with feedback statistics and charts
- Create and update feedback for team members
- View all feedback given to employees
- Team member management
- Sentiment analysis visualization

### Employee Features
- Personal dashboard with feedback timeline
- View and acknowledge received feedback
- Feedback statistics and progress tracking
- Clean, intuitive interface

### Feedback System
- Structured feedback with strengths and areas to improve
- Sentiment classification (Positive/Neutral/Negative)
- Acknowledgment tracking
- Timestamp and audit trail

### Bonus Features
- In-app notifications (notification bell)
- Email notifications
- Feedback requests (employees can request feedback from managers)
- Anonymous peer feedback (with optional flag)
- Tagging and tag filtering (e.g., communication, leadership)
- Export feedback as PDF (for managers)
- Employee comments on feedback (with markdown support)

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation with email support
- **JWT** - Authentication tokens
- **Passlib** - Password hashing with bcrypt
- **Docker** - Containerization

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Recharts** - Chart library
- **Lucide React** - Icon library

## 📁 Project Structure

```
InternshipAssignment/
├── backend/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── feedback.py
│   │   └── users.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── services.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Profile.js
│   │   │   ├── Navbar.js
│   │   │   ├── ManagerDashboard.js
│   │   │   ├── EmployeeDashboard.js
│   │   │   ├── FeedbackForm.js
│   │   │   ├── FeedbackList.js
│   │   │   ├── FeedbackDetail.js
│   │   │   ├── FeedbackItem.js
│   │   │   ├── FeedbackRequestForm.js
│   │   │   ├── FeedbackRequestList.js
│   │   │   └── NotificationBell.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🌐 Live Deployment

- **Frontend (Vercel):** [https://feedback-system-seven-delta.vercel.app](https://feedback-system-seven-delta.vercel.app)

- **Backend (Render):** [https://feedbacksystem-n26h.onrender.com](https://feedbacksystem-n26h.onrender.com)

---

## ⚙️ Deployment & Environment

### Environment Variables

#### Backend (Render)
- `FRONTEND_ORIGINS` — Comma-separated list of allowed frontend URLs (e.g. `https://feedback-system-seven-delta.vercel.app,https://feedbacksystem-frontend.onrender.com`)
- `SECRET_KEY`, `DATABASE_URL`, etc. (see code for details)

#### Frontend (Vercel/Render)
- `REACT_APP_API_URL` — URL of your backend (e.g. `https://feedbacksystem-n26h.onrender.com`)

### CORS Troubleshooting
- If you get CORS errors, make sure your backend's `FRONTEND_ORIGINS` includes all frontend URLs (Vercel, Render, localhost for dev).
- Always redeploy the backend after changing environment variables.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   Or using Docker:
   ```bash
   docker build -t feedback-backend .
   docker run -p 8000:8000 feedback-backend
   ```

4. **Access API documentation:**
   - Swagger UI: http://127.0.0.1:8000/docs
   - ReDoc: http://127.0.0.1:8000/redoc

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000

## 👥 Getting Started

### 1. Create Your Account
1. Navigate to http://localhost:3000
2. Click "Sign up" to create a new account
3. Fill in your details and choose your role (Manager/Employee)
4. You'll be automatically logged in after registration

### 2. Login
1. Use your username and password to sign in
2. You'll be redirected to your role-specific dashboard

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### User Management
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account
- `GET /users/employees` - Get employee list (managers only)

### Feedback
- `GET /feedback/` - Get feedback (role-based)
- `POST /feedback/` - Create new feedback (managers only)
- `GET /feedback/{id}` - Get specific feedback
- `PUT /feedback/{id}` - Update feedback (managers only)
- `POST /feedback/{id}/acknowledge` - Acknowledge feedback (employees only)
- `GET /feedback/dashboard/stats` - Get dashboard statistics

## 🎯 User Walkthrough

### 1. Registration & Login
1. Visit the application and click "Sign up"
2. Fill in your details and choose your role
3. Login with your credentials

### 2. Manager Experience
1. View manager dashboard with statistics and charts
2. See team members list
3. Create new feedback for employees
4. View and edit existing feedback

### 3. Employee Experience
1. View employee dashboard with received feedback
2. See feedback timeline and statistics
3. Acknowledge feedback items
4. Update profile information

### 4. Profile Management
1. Click on your name in the navbar
2. Select "Profile Settings"
3. Update your information or change password
4. Optionally delete your account

## 🐳 Docker Deployment

### Backend Only
```bash
cd backend
docker build -t feedback-backend .
docker run -p 8000:8000 feedback-backend
```

### Full Stack (Docker Compose)
```bash
docker-compose up --build
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Pydantic
- Email validation
- CORS configuration
- SQL injection protection with SQLAlchemy

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: manager/employee)

### Feedback Table
- `id` (Primary Key)
- `manager_id` (Foreign Key)
- `employee_id` (Foreign Key)
- `strengths` (Text)
- `improvements` (Text)
- `sentiment` (Enum: positive/neutral/negative)
- `acknowledged` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## 🎨 UI/UX Features

- Responsive design with Tailwind CSS
- Clean, professional interface
- Role-based navigation
- Interactive charts and statistics
- Loading states and error handling
- Intuitive feedback forms
- Timeline view for feedback history
- User profile management
- Mobile-responsive design

## 🚀 Future Enhancements

- Email verification for registration
- Password reset functionality
- Feedback templates
- Advanced analytics
- Team hierarchy management
- Feedback scheduling
- Mobile app support
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is created for internship assignment purposes.

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

**Note:** This application includes proper user registration, authentication, and profile management. All passwords are securely hashed and user data is properly validated.

## 📸 Screenshots & ERD

### Employee Dashboard
![Employee Dashboard](./screenshots/employee_dashboard.png)

### Manager Dashboard
![Manager Dashboard](./screenshots/manager_dashboard.png)

### Feedback List (Employee)
![Employee Feedback List](./screenshots/feedback_list_employee.png)

### Feedback List (Manager)
![Manager Feedback List](./screenshots/feedback_list_manager.png)

### Entity Relationship Diagram (ERD)
![ER Diagram](./screenshots/erd.png) 