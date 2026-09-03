import { NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminSession } from '@/lib/admin/auth';
import { logAdminAction } from '@/services/audit.service';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, accessKey } = body;

    const validation = validateAdminCredentials(email, password, accessKey);

    if (!validation.valid || !validation.admin) {
      // Return 503 if environment variables are missing, otherwise 401
      const isConfigError = validation.error === 'Admin authentication is temporarily unavailable.';
      return NextResponse.json(
        { error: validation.error || 'Invalid administrative credentials.' },
        { status: isConfigError ? 503 : 401 }
      );
    }

    // Create secure 8-hour HTTP-only cookie session
    const session = createAdminSession({
      uid: validation.admin.uid,
      email: validation.admin.email,
      name: validation.admin.name,
      role: validation.admin.role,
    });

    // Record audit event non-blockingly
    logAdminAction({
      adminUid: validation.admin.uid,
      adminName: validation.admin.name,
      action: 'admin.logged_in',
      entityType: 'admin',
      entityId: validation.admin.uid,
      summary: `Super Admin (${validation.admin.email}) logged into the TicketX admin panel.`,
    }).catch(() => {});


    return NextResponse.json({
      success: true,
      admin: {
        email: session.email,
        role: session.role,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'Invalid administrative credentials.' },
      { status: 500 }
    );
  }
}
