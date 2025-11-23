# Internal Ticketing System

## Features

### User Features

- User registration and authentication (JWT-based)
- Create support tickets with descriptions, categories, and file attachments
- Upload images and PDFs (up to 5MB per file)
- Real-time ticket discussion thread
- Personal dashboard with ticket overview
- Filter tickets by category
- View ticket creation and last updated dates

### Admin Features

- Separate admin portal with dedicated login
- Comprehensive dashboard with metrics:
  - Total tickets
  - Open, In Progress, Resolved/Closed tickets
  - SLA breach tracking
- Advanced filtering:
  - Filter by category, priority
  - Sort by resolution date (ascending/descending)
  - Multi-filter support
- Priority management (Low, Medium, High)
- SLA deadline tracking with visual alerts:
  - Red badge for breached SLA
  - Yellow badge for tickets within 24 hours of breach
- Admin tracking: See who last updated each ticket
- View and download user-uploaded attachments

### Security & Best Practices

- JWT authentication with 15-day expiration
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (User/Admin)
- Protected API routes with authentication middleware
- CORS configuration for production
- Input validation and sanitization

---

## Tech Stack

### Frontend

- **React**
- **React Router**
- **Vite**
- **Tailwind CSS**
- **Shadcn UI**
- **Axios**
- **Lucide React**

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **dotenv** - Environment configuration

---

<!-- ## Architecture

```
┌─────────────────┐
│   React SPA     │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │
│   (Backend)     │
└────────┬────────┘
         │ Mongoose
         │
┌────────▼────────┐
│    MongoDB      │
│   (Database)    │
└─────────────────┘
``` -->

<!--
### Request Flow:

1. **User Action** → React component
2. **API Call** → Axios sends request to Express
3. **Authentication** → JWT middleware validates token
4. **Authorization** → Role-based access check
5. **Controller** → Business logic execution
6. **Database** → Mongoose query to MongoDB
7. **Response** → Data sent back to frontend
8. **UI Update** → React re-renders with new data -->

---

## Installation & Usage

### Prerequisites

- **Node.js** (>= 14.x)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)

### Clone Repository

```bash
git clone https://github.com/anaskhaann/ticket_system_task.git
cd ticket_system_task
```

### Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd client
npm install
```

---

## 🚀 Running Locally

### Step 1: Start MongoDB

If using local MongoDB:

```bash
mongod
```

If using MongoDB Atlas, ensure you have your connection string ready.

### Step 2: Configure Environment Variables

**Backend (.env):**
Create `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ticketing-system
JWT_SECRET=your_random_64_character_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Frontend (.env):**
Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### Step 3: Seed Database (Optional)

I have not implemented new registration for admin we need to create admin from code using the seed file where we pass the admin name, email and password.

Create initial admin user:

```bash
cd server
npm run seed
```

This creates:

- **Admin:** `admin@company.com` / `sample123`

### Step 4: Start Backend Server

```bash
cd server
npm start
```

Server runs on `http://localhost:5000`

### Step 5: Start Frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`

### Step 6: Access Application

- **User Portal:** [http://localhost:5173/login](http://localhost:5173/login)
- **Admin Portal:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 🔑 Key Features Implementation

### 1. Authentication & Authorization

**How it works:**

- User registers ==> Password hashed with bcrypt ==> Stored in DB
- User logs in ==> Credentials verified ==> JWT token generated
- Token sent with every API request in `Authorization` header
- Middleware decodes token ==> Attaches user to `req.user`
- Controllers check `req.user.role` for authorization

---

### 2. File Upload System

**How it works:**

- Frontend sends files via `FormData`
- Multer middleware intercepts request
- Files saved to `server/uploads/` directory
- File metadata stored in ticket `attachments` array
- Frontend displays download links using file path

---

### 3. SLA Tracking & Alerts

**How it works:**

- Admin sets `resolutionDate` on ticket
- Frontend calculates time remaining
- Visual alerts trigger based on thresholds:
  - **Breached:** Current date > resolution date
  - **Warning:** < 24 hours remaining

---

### 4. Advanced Filtering System

**How it works:**

- Frontend maintains filter state (category, priority, dateSort)
- `useEffect` watches filter changes
- Tickets filtered client-side for instant response
- Supports multiple filters simultaneously

---

### 5. Admin Tracking

**How it works:**

- `lastUpdatedBy` field references User who modified ticket
- Updated automatically on ticket update
- Populated with user details on fetch
- Displayed in ticket list and detail view

---

## Project Structure

```
ticketing-system/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   └── Layout.jsx # App layout with navbar
│   │   ├── context/       # React Context for state
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/         # Route components
│   │   │   ├── Login.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   └── TicketDetail.jsx
│   │   ├── config/
│   │   │   └── api.js     # API URL configuration
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/
│   └── package.json
│
├── server/                # Backend Express app
│   ├── config/
│   │   ├── db.js         # MongoDB connection
│   │   └── multer.js     # File upload config
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT authentication
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   └── Ticket.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/          # Uploaded files
│   ├── seed.js           # Database seeder
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  title: String,
  description: String,
  category: String (enum: ['Hardware', 'Software', 'Mechanical', 'Electrical', 'Other']),
  status: String (enum: ['Open', 'In Progress', 'Resolved', 'Closed']),
  priority: String (enum: ['Low', 'Medium', 'High']),
  resolutionDate: Date,
  lastUpdatedBy: ObjectId (ref: 'User'),
  responses: [
    {
      user: ObjectId (ref: 'User'),
      message: String,
      createdAt: Date
    }
  ],
  attachments: [
    {
      filename: String,
      path: String,
      uploadedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```
