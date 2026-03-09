import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isConfigured = !!(url && anonKey && serviceRoleKey);
    const message = isConfigured
      ? 'All required environment variables are set'
      : `Missing: ${[!url && 'NEXT_PUBLIC_SUPABASE_URL', !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY', !serviceRoleKey && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ')}`;

    return NextResponse.json({
      isConfigured,
      message,
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      hasServiceRoleKey: !!serviceRoleKey,
    });
  } catch (error) {
    return NextResponse.json(
      {
        isConfigured: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
