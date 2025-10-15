# Student Internship and Job Portal – Frontend (React + Tailwind)

This branch (`frontend`) contains the **completed frontend implementation** of the Smart CareerBridge platform.  
It includes UI, logic, and localStorage-based persistence for **Students, Employers, and Admins**, ready for backend integration.

---

##  Features Implemented

###  Authentication
- **Register**: Users can register as Student, Employer, or Admin.
  - Employers are **unverified by default** until approved by Admin.
  - Duplicate email check implemented.
- **Login**: Basic login per role (no backend yet).
- **Toast notifications** for success/errors.

---

###  Student Role
- **Dashboard**: Landing after login.
- **Browse Jobs**: View jobs posted by employers.
- **My Applications**: Track applied jobs (stored in localStorage).

---

###  Employer Role
- **Dashboard** with posting and viewing jobs.
- **Post Job** form: title, company, type, location, deadline.
- **Manage Jobs**: Employers can view and manage their own postings.

---

### Admin Role
- **Dashboard**: Summary cards with live counts:
  - Total Users
  - Verified Employers
  - Total Jobs
  - Applications
- **Manage Users**:
  - View all registered users
  - **Approve/Unverify Employers**
  - **Suspend/Reactivate Users**
  - **Edit User Info** (name, email, role, verified flag)
  - **Delete with Undo** (soft-delete, 8-second window)
- **Manage Jobs**:
  - View all posted jobs
  - **Delete with Undo** (soft-delete, 8-second window)
- Live updates synced across tabs (via localStorage `storage` events).

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Login |
| `/register` | Register new account |
| `/student` | Student Dashboard |
| `/student/jobs` | Student – Browse Jobs |
| `/student/applications` | Student – My Applications |
| `/employer` | Employer Dashboard |
| `/employer/jobs` | Employer – My Jobs |
| `/admin` or `/admin/dashboard` | Admin Overview |
| `/admin/users` | Admin – Manage Users |
| `/admin/jobs` | Admin – Manage Jobs |

---

##  LocalStorage Keys

- `registeredUsers` → All registered users  
- `employerJobs` → Jobs posted by employers  
- `appliedJobs` → Jobs applied to by students  

---

##  Next Steps (Backend)

- Replace localStorage with database + API endpoints  
- Implement proper authentication (hashed passwords, sessions/JWT)  
- Connect Student job applications to Employer job postings via backend  
- Add CV Parser integration (4th member task)  

---

## How to Run

```bash
npm install
npm run dev
