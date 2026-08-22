import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ticketx: 'ok',
    dataSource: 'local-cinema-dataset',
  });
}
