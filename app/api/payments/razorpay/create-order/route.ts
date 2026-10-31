import { NextResponse } from 'next/server';
export async function POST(){return NextResponse.json({error:'Real payments are unavailable: TicketX currently offers demo bookings only.'},{status:403});}
