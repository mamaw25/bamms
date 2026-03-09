This is a [Next.js](https://nextjs.org) project for managing attendance and meetings. It is bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Resend API key (for email verification)

### Initial Setup

1. **Clone the repository and install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Open the application:**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Initial Database Setup

Run the SQL commands from `DATABASE_SETUP.md` in your Supabase SQL Editor to create required tables.

## Project Features

- **Attendance Management**: Clock in/out via kiosk
- **Staff Management**: Admin dashboard for managing staff
- **Leave Requests**: Staff can request leave, admins can approve/reject
- **Meeting Management**: Schedule meetings and track attendance
- **Email Verification**: Secure user registration with email verification
- **Role-Based Access**: Admin and staff roles with different permissions

## Troubleshooting

If you encounter any issues:

1. **Check the diagnostics page**: [http://localhost:3000/diagnostics](http://localhost:3000/diagnostics)
2. **Read the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide**
3. **Review database setup in [DATABASE_SETUP.md](DATABASE_SETUP.md)**
4. **Check email configuration in [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md)**

## Documentation

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database schema and setup
- [EMAIL_VERIFICATION_SETUP.md](EMAIL_VERIFICATION_SETUP.md) - Email verification configuration
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [MEETING_MINUTES_SETUP.md](MEETING_MINUTES_SETUP.md) - Meeting minutes feature
- [LEAVE_REQUEST_SETUP.md](LEAVE_REQUEST_SETUP.md) - Leave request system

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
