import { NextResponse } from 'next/server';
import { destroyAdminSession, getCurrentAdmin } from '@/lib/admin/auth';
import { logAdminAction } from '@/services/audit.service';

export async function POST() {
  try {
    const session = getCurrentAdmin();
    if (session) {
      try {
        await logAdminAction({
          adminUid: session.uid,
          adminName: session.name,
          action: 'admin.logged_out',
          entityType: 'admin',
          entityId: session.uid,
          summary: `${session.name} (${session.email}) logged out of the TicketX admin panel.`,
        });
      } catch (auditErr) {
        console.error('Failed to log logout audit:', auditErr);
      }
    }

    destroyAdminSession();
    return NextResponse.json({ success: true });
  } catch {
    destroyAdminSession();
    return NextResponse.json({ success: true });
  }
}
