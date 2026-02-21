# Email Verification Setup

This document describes the database setup required for email verification during registration.

## Database Migration

Run these SQL commands in your Supabase SQL Editor to add email verification support:

```sql
-- Add email verification columns to profiles table
ALTER TABLE profiles 
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN email_verification_token TEXT,
ADD COLUMN email_verification_token_expires_at TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX idx_profiles_email_verification_token ON profiles(email_verification_token);

-- Create index for faster verification status queries
CREATE INDEX idx_profiles_email_verified ON profiles(email_verified);
```

## How Email Verification Works

1. **User Registration**: When a user registers, their email is marked as `email_verified = false` and a unique verification token is generated.

2. **Verification Email**: A verification email is sent to the user with a link containing the token.

3. **Token Verification**: When the user clicks the link, the token is validated and the email is marked as verified.

4. **Login**: Users can only log in if their email is verified.

## Environment Variables

Make sure you have these environment variables set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (using Resend service)
RESEND_API_KEY=your_resend_api_key

# Application Base URL (for verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update for production
```

## Implementation Notes

- Verification tokens expire after 24 hours
- Tokens are securely generated using crypto
- Email sending uses the Resend service (https://resend.com/)
- The verification link format: `{APP_URL}/verify-email?token={token}`
