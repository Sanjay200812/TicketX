import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin/session';
import { seedStaticDataToFirestore } from '@/services/settings.service';

export async function POST() {

  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Only Super Administrators can trigger database seed.' },
        { status: 403 }
      );
    }

    const report = await seedStaticDataToFirestore({
      uid: session.uid,
      name: session.name,
    });

    return NextResponse.json({
      success: true,
      message: 'Database successfully populated with static datasets.',
      report,
    });
  } catch (err: unknown) {
    console.error('Database seed API error:', err);
    return NextResponse.json(
      { error: 'Failed to seed database.' },
      { status: 500 }
    );
  }
}
