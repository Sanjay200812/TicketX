import { NextResponse } from 'next/server';
import { getStoredCustomerByUid, updateStoredCustomerStatus } from '@/lib/serverUserStore';
import { getUserBookings } from '@/lib/serverBookingStore';
import { getRecentLoginEvents } from '@/lib/serverActivityStore';
import { getCurrentAdmin } from '@/lib/admin/auth';
import { logAdminAction } from '@/services/audit.service';

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { uid } = params;
    const customer = getStoredCustomerByUid(uid);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const bookings = getUserBookings(uid);
    const totalSpent = bookings.reduce((sum, b) => sum + (b.pricing?.grandTotal || 0), 0);
    const completedBookings = bookings.filter((b) => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'removed').length;

    const allLogins = getRecentLoginEvents(50);
    const customerLogins = allLogins.filter((e) => e.uid === uid);

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        totalSpent: totalSpent > 0 ? totalSpent : customer.totalSpent,
        totalBookings: bookings.length > 0 ? bookings.length : customer.totalBookings,
      },
      summary: {
        totalBookings: bookings.length,
        completedBookings,
        cancelledBookings,
        upcomingBookings: bookings.filter((b) => new Date(b.date).getTime() >= Date.now()).length,
        totalSpent: totalSpent > 0 ? totalSpent : customer.totalSpent,
        refundedAmount: 0,
      },
      bookings,
      activity: customerLogins,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch customer profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { uid } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status field' }, { status: 400 });
    }

    const success = updateStoredCustomerStatus(uid, status);
    if (!success) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    logAdminAction({
      adminUid: admin.uid,
      adminName: admin.name,
      action: status === 'suspended' ? 'user.blocked' : 'user.unblocked',
      entityType: 'user',
      entityId: uid,
      summary: `${admin.name} changed customer account "${uid}" status to ${status}.`,
    }).catch(() => {});

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update customer status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
