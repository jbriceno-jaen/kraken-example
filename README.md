# Kraken Elite Fitness

A modern CrossFit gym management platform built with Next.js, featuring class reservations, personal record tracking, and member profiles.

## Features

- 🏋️ **Class Reservations**: Book training sessions for morning (5-8 AM) or afternoon (4-7 PM) slots
- 📊 **Personal Records**: Track and manage your PRs (Personal Records) for different exercises
- 👤 **Member Profiles**: Update your information, training goals, and profile photo
- 🔐 **Authentication**: Secure authentication powered by NextAuth.js with credentials provider
- ✅ **User Approval System**: New client registrations require manager approval before access
- ⏰ **Subscription Management**: Clients with expired subscriptions cannot log in and are notified
- 💾 **Database**: PostgreSQL database (Neon) with Drizzle ORM
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations and vibrant red gradients
- 🎯 **Brand Identity**: Consistent Kraken Elite Fitness branding with Orbitron font and custom red color scheme
- 🎨 **Custom Select Styling**: Custom dropdown arrows positioned optimally for better UX
- 👥 **Manager Dashboard**: Complete management system for gym administrators
- 📅 **WOD Management**: Workout of the Day creation and management with timezone-safe date handling
- ⏰ **Class Scheduling**: Flexible class slot management per day of the week
- 🔔 **Notifications**: Automatic notifications when users are added, approved, or deleted
- 🔐 **Password Recovery**: Forgot password functionality with email-based password reset
- ⚡ **Turbopack**: Fast development builds with Next.js 16's Turbopack bundler
- 🍪 **Optimized Sessions**: JWT sessions optimized to stay under 4096 bytes cookie limit
- 🔄 **Real-time Updates**: Loading screens and refresh functionality for class schedules and attendance
- 🎯 **Smart Date Handling**: Timezone-safe date pickers and local date parsing throughout the application
- 📱 **Responsive Design**: Mobile-first design with optimized spacing and touch targets

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Authentication**: NextAuth.js v4 (optimized JWT sessions)
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Icons**: Lucide React
- **Bundler**: Turbopack (faster development builds)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kraken-example
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Email (Resend) - Required for password reset functionality
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Kraken Elite Fitness <noreply@yourdomain.com>
```

**Generate NEXTAUTH_SECRET:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Set up the database:
```bash
# Push schema to database
npm run db:push

# Or generate migrations
npm run db:generate
npm run db:migrate
```

5. Create a manager user:
See [README-DATABASE.md](./README-DATABASE.md) for instructions on creating a manager user.

6. Run the development server:
```bash
npm run dev
```

The development server uses Turbopack for faster compilation. If you encounter issues, you can use the Webpack fallback:
```bash
npm run dev:webpack
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Note**: The first compilation may take 30-60 seconds. Subsequent compilations will be faster thanks to Turbopack's file system cache.

## Project Structure

```
kraken-example/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints (login, register, forgot-password, reset-password)
│   │   ├── manager/       # Manager-only endpoints
│   │   ├── profile/       # User profile management
│   │   ├── reservations/  # Class reservations
│   │   └── personal-records/  # Personal records CRUD
│   ├── dashboard/         # Client dashboard pages
│   │   ├── reservas/      # Reservations page
│   │   ├── perfil/        # Profile page
│   │   ├── prs/           # Personal records page
│   │   └── programacion/  # WOD viewing page
│   ├── manager/            # Manager dashboard pages
│   │   ├── usuarios/      # User management
│   │   ├── wod/           # WOD management
│   │   ├── clases/        # Class attendance
│   │   └── horarios/      # Class slots management
│   ├── reset-password/    # Password reset page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── manager/          # Manager-specific components
│   └── auth/             # Authentication modals (login, register, forgot-password)
├── src/
│   └── db/               # Database configuration
│       ├── client.ts      # Database client
│       └── schema.ts      # Database schema
└── src/
    └── lib/              # Utility functions
        ├── utils.ts      # General utilities
        ├── auth.ts       # NextAuth configuration
        └── email.ts      # Email sending utilities (Resend)
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack (recommended)
- `npm run dev:webpack` - Start development server with Webpack (fallback)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:test` - Test database connection
- `npm run db:setup` - Setup and verify database

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user (requires manager approval for clients)
- `POST /api/auth/change-password` - Change user password (requires authentication)
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-reset-token` - Verify reset token validity
- `POST /api/auth/check-approval` - Check if user account is approved and subscription status

### Profile
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create or update profile
- `POST /api/profile/image` - Upload/update profile image
- `DELETE /api/profile/image` - Remove profile image

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create new reservation
- `DELETE /api/reservations/[id]` - Cancel reservation

### Personal Records
- `GET /api/personal-records` - Get all PRs
- `POST /api/personal-records` - Create new PR
- `GET /api/personal-records/[id]` - Get specific PR
- `PATCH /api/personal-records/[id]` - Update PR
- `DELETE /api/personal-records/[id]` - Delete PR

### Class Slots
- `GET /api/class-slots` - Get available class slots

### Manager Endpoints (Manager only)
- `GET /api/manager/users` - Get all users (includes approval status)
- `POST /api/manager/users` - Create user (automatically approved)
- `PATCH /api/manager/users/[id]` - Update user (can update approval status)
- `DELETE /api/manager/users/[id]` - Delete user (cancels all reservations)
- `PATCH /api/manager/users/[id]/approve` - Approve or reject user (cancels reservations if rejected)
- `GET /api/manager/wod` - Get WODs
- `POST /api/manager/wod` - Create WOD
- `PUT /api/manager/wod/[id]` - Update WOD
- `DELETE /api/manager/wod/[id]` - Delete WOD
- `GET /api/manager/class-slots` - Get class slots
- `POST /api/manager/class-slots` - Create class slot
- `PATCH /api/manager/class-slots/[id]` - Update class slot
- `DELETE /api/manager/class-slots/[id]` - Delete class slot

## Database Schema

- **users**: User accounts (clients and managers)
- **profiles**: Extended user profile information
- **reservations**: Class reservations
- **personal_records**: Personal record tracking
- **class_slots**: Available class time slots
- **workout_of_day**: Workout of the Day (WOD)
- **class_attendees**: Manager-assigned class attendees
- **password_reset_tokens**: Password reset tokens (expire after 1 hour)

## User Roles

- **client**: Regular gym member with access to reservations, PRs, and profile
  - New clients must be approved by a manager before they can log in
  - Clients cannot log in until their account is approved
  - Clients with expired subscriptions cannot log in and are automatically signed out
  - All reservations are automatically canceled if a client is rejected or deleted
- **manager**: Administrator with full access to user management, WOD creation, and class management
  - Managers are always approved automatically
  - Can approve/reject client registrations
  - Can create users directly (these are automatically approved)

## Documentation

- [Database Setup Guide](./README-DATABASE.md) - Database configuration and setup
- [Style Guide](./README-STYLES.md) - UI/UX design patterns and guidelines
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [NextAuth Setup](./NEXTAUTH_SETUP.md) - Authentication configuration
- [Resend Setup](./RESEND_SETUP.md) - Email service configuration for password reset

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps:

1. **Push your code to GitHub**
2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables (see DEPLOYMENT.md)
   - Click "Deploy"

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
   - Add for Production, Preview, and Development
   - **Redeploy** after adding variables

4. **Push Database Schema**
   ```bash
   npm run db:push
   ```

### Free Tier Benefits

- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Serverless functions
- ✅ Perfect for testing and small projects
