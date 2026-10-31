import { ensureDemoInventory } from '@/lib/demoInventory';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { bookingDatabase } from '@/lib/bookingDatabase';
export const dynamic = 'force-dynamic';
const cookieName='ticketx_booking_owner';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function owner(request:NextRequest){const value=request.cookies.get(cookieName)?.value;return value&&uuid.test(value)?value:randomUUID();}
function respond(data:unknown,identity:string,status=200){const response=NextResponse.json(data,{status});response.cookies.set(cookieName,identity,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:60*60*24*30});response.headers.set('Cache-Control','no-store');return response;}
export async function GET(request:NextRequest){
 const identity=owner(request);const show=request.nextUrl.searchParams.get('showId');
 if(!show)return respond({error:'Choose a show'},identity,400);
 try{await ensureDemoInventory(show);const sql=bookingDatabase();const rows=await sql`select seat_id,price_paise,case when unavailable then 'unavailable' when booking_id is not null then 'booked' when hold_expires_at > clock_timestamp() then case when hold_owner=${identity}::uuid then 'selected' else 'held' end else 'available' end as status,case when hold_owner=${identity}::uuid then hold_expires_at else null end as expires_at from ticketx.show_seats where show_id=${show} order by seat_id`;return respond({seats:rows,demo:true},identity);}catch{return respond({error:'Seat availability is temporarily unavailable. Please retry.'},identity,503);}
}
export async function POST(request:NextRequest){
 const identity=owner(request);
 if(request.headers.get('origin')!==request.nextUrl.origin)return respond({error:'Invalid request origin'},identity,403);
 try{const body=await request.json();const {showId,seats,action,requestId}=body;
 if(typeof showId!=='string'||!Array.isArray(seats)||seats.length<1||seats.length>10||seats.some(s=>typeof s!=='string'||!s||s.length>50)||new Set(seats).size!==seats.length)return respond({error:'Select between one and ten distinct seats'},identity,400);
 const sql=bookingDatabase();
 if(action==='hold'){const [result]=await sql`select ticketx.reserve(${showId},${seats}::text[],${identity}::uuid) as expires_at`;return respond(result,identity);}
 if(action==='release'){await sql`update ticketx.show_seats set hold_owner=null,hold_expires_at=null where show_id=${showId} and seat_id=any(${seats}::text[]) and hold_owner=${identity}::uuid and booking_id is null`;return respond({released:true},identity);}
 if(action==='confirm'&&typeof requestId==='string'&&uuid.test(requestId)){const [booking]=await sql`select * from ticketx.confirm_demo(${showId},${seats}::text[],${identity}::uuid,${requestId}::uuid)`;return respond({booking,message:'Demo Booking — No actual cinema ticket has been issued.'},identity);}
 return respond({error:'Invalid booking action'},identity,400);
 }catch(error){const code=(error as {code?:string}).code;return respond({error:code==='P0001'?'Your hold expired or a seat is unavailable. Please select your seats again.':'Booking is temporarily unavailable. Please retry.'},identity,code==='P0001'?409:503);}
}

