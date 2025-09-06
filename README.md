# Internship Attendance Verification System

A comprehensive full-stack web application for managing student internships with email-based attendance verification, built with Next.js, PostgreSQL, and Prisma.

## 🚀 Features

### 🧑‍🎓 Student Portal
- Secure login with role-based authentication
- Submit internship forms with company details
- Upload offer letters (via URL)
- Request daily attendance verification
- Track attendance history

### 🧑‍🏫 Teacher Portal
- Review and approve/reject internship applications
- Monitor student attendance patterns
- Access comprehensive audit logs
- View IP addresses, locations, and timestamps

### 👨‍💼 HR Verification (No Login Required)
- Receive email notifications for attendance verification
- One-click Present/Absent buttons
- Secure JWT token-based verification
- Automatic attendance recording

## 🛠️ Tech Stack

- **Frontend & Backend**: Next.js 13+ (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with role-based access
- **Email**: SendGrid/SMTP integration (placeholder)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Security**: JWT tokens, IP tracking, location logging

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd internship-attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your database URL, JWT secret, and email service configuration.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### User
- `id` - Unique identifier
- `name` - Full name
- `email` - Email address (unique)
- `password` - Hashed password
- `role` - STUDENT or TEACHER

### InternshipForm
- `id` - Unique identifier
- `studentId` - Foreign key to User
- `teacherId` - Foreign key to User
- `companyName` - Company name
- `offerLetterURL` - URL to offer letter
- `supervisorEmail` - Supervisor's email
- `hrEmail` - HR contact email
- `status` - PENDING, APPROVED, or REJECTED

### Attendance
- `id` - Unique identifier
- `studentId` - Foreign key to User
- `internshipFormId` - Foreign key to InternshipForm
- `date` - Date of attendance
- `status` - PENDING, VERIFIED, or ABSENT
- `verificationToken` - JWT token for email verification

### VerificationLog
- `id` - Unique identifier
- `attendanceId` - Foreign key to Attendance
- `ipAddress` - IP address of verifier
- `location` - Geolocation (from IP)
- `userAgent` - Browser information
- `action` - present or absent
- `timestamp` - When verification occurred

## 🔄 User Flows

### Student Flow
1. Login at `/student/login`
2. Submit internship form with:
   - Academic teacher selection
   - Company details
   - Offer letter URL
   - HR email
3. Wait for teacher approval
4. Click "I'm at the Company" to request verification
5. System sends email to HR with Present/Absent buttons

### Teacher Flow
1. Login at `/teacher/login`
2. Review pending internship forms
3. Approve or reject applications
4. Monitor student attendance
5. View audit logs with IP and location data

### HR Flow (No Login)
1. Receive email with verification request
2. Click "Present" or "Absent" button
3. System validates JWT token
4. Attendance is automatically recorded
5. Verification is logged with metadata

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Separate portals for students and teachers
- **IP Tracking**: Log IP addresses for all verifications
- **Location Logging**: Track geographic location from IP
- **Token Expiration**: JWT tokens expire after 7 days
- **Input Validation**: Comprehensive validation on all forms

## 📧 Email Integration

The system includes placeholder integration for email services:

### SendGrid Integration
```javascript
// In production, uncomment and configure:
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
await sgMail.send({ to, from, subject, html })
```

### SMTP Integration
```javascript
// Or configure SMTP settings in .env:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🔧 API Routes

### Authentication
- `POST /api/auth/login/student` - Student login
- `POST /api/auth/login/teacher` - Teacher login
- `POST /api/auth/logout` - Logout

### Internship Management
- `POST /api/internship-form` - Create internship form
- `GET /api/internship-form` - Get user's forms
- `PATCH /api/internship-form/[id]/approve` - Approve/reject form

### Attendance
- `POST /api/attendance/request` - Request attendance verification
- `GET /api/attendance/verify` - Verify attendance (from email)

### Data Access
- `GET /api/users/teachers` - Get list of teachers
- `GET /api/logs` - Get verification logs

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   - Configure PostgreSQL instance
   - Update DATABASE_URL in production environment

3. **Configure email service**
   - Set up SendGrid or SMTP credentials
   - Update email service configuration

4. **Deploy to your preferred platform**
   - Vercel, Netlify, or any Node.js hosting service
   - Ensure environment variables are configured

## 🧪 Development

### Running Tests
```bash
npm test
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.# Interntrack
