import { NextRequest, NextResponse } from 'next/server';
import { CafeUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('restro_session');
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = JSON.parse(decodeURIComponent(sessionCookie.value)) as CafeUser;
    return NextResponse.json({ authenticated: true, user });
  } catch (e: any) {
    return NextResponse.json({ authenticated: false, error: e?.message }, { status: 401 });
  }
}
