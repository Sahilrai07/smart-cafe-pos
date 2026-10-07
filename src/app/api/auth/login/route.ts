import { NextRequest, NextResponse } from 'next/server';
import { CAFE_ACCOUNTS, CafeUser } from '@/lib/auth';

function normalize(str: string): string {
  return str.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json(
        { error: 'ID and password are required.' },
        { status: 400 }
      );
    }

    const cleanId = normalize(id);
    const cleanPass = password.trim();

    let matchedUser: CafeUser | null = null;
    for (const acc of CAFE_ACCOUNTS) {
      const isIdMatch = acc.aliases.some((alias) => normalize(alias) === cleanId);
      if (!isIdMatch) continue;

      const isPassMatch = acc.passwords.some(
        (p) => p.trim() === cleanPass || normalize(p) === normalize(cleanPass)
      );

      if (isPassMatch) {
        matchedUser = acc.user;
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Invalid Cafe ID or Password. Please check your credentials.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: matchedUser,
      message: `Welcome, ${matchedUser.name}!`,
    });

    // Set secure session cookie
    response.cookies.set('restro_session', encodeURIComponent(JSON.stringify(matchedUser)), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: false, // Accessible to client scripts as well
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
