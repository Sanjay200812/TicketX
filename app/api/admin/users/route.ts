import { NextResponse } from 'next/server';
import { getAllStoredCustomers, getCustomerMetrics, updateStoredCustomerStatus } from '@/lib/serverUserStore';
import { getRecentLoginEvents } from '@/lib/serverActivityStore';
import { getCurrentAdmin } from '@/lib/admin/auth';
import { logAdminAction } from '@/services/audit.service';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const customers = getAllStoredCustomers();
    const metrics = getCustomerMetrics();
    const recentLogins = getRecentLoginEvents(15);

    return NextResponse.json({
      success: true,
      customers,
      metrics,
      recentLogins,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch customers';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { uid, status, name } = body;

    if (!uid || !status) {
      return NextResponse.json({ error: 'Missing parameters (uid, status)' }, { status: 400 });
    }

    const success = updateStoredCustomerStatus(uid, status);
    if (!success) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Log admin action
    logAdminAction({
      adminUid: admin.uid,
      adminName: admin.name,
      action: status === 'suspended' ? 'user.blocked' : 'user.unblocked',
      entityType: 'user',
      entityId: uid,
      summary: `${admin.name} updated customer "${name || uid}" status to ${status}.`,
    }).catch(() => {});

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update customer status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
