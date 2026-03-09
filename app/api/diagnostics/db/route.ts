import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json(
        {
          connected: false,
          message: 'Missing Supabase configuration',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(url, anonKey);

    // Try a simple query to test the connection
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({
        connected: false,
        message: `Connection error: ${error.message}`,
      });
    }

    return NextResponse.json({
      connected: true,
      message: 'Successfully connected to Supabase',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Supabase connection test error:', error);

    return NextResponse.json(
      {
        connected: false,
        message: `Connection test failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
