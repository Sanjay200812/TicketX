import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin/auth';
import { ROLE_PERMISSIONS } from '@/lib/admin/permissions';

export async function GET() {
  try {
    const session = getCurrentAdmin();

    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        email: session.email,
        role: session.role,
      },
      permissions: ROLE_PERMISSIONS[session.role] || [],
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
