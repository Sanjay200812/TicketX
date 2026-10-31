"use client";
import { TicketXSeatSection } from '@/types/seatLayouts';
export function SeatLegend({sections}: {sections?:TicketXSeatSection[];isEvent?:boolean}){
 return <div className="flex flex-wrap justify-center gap-5 text-xs py-5" aria-label={`Seat status legend for ${sections?.length || 0} categories`}>{['available','selected','held','booked','disabled'].map(state=><span key={state} className="flex gap-2 items-center"><span className={`tx-seat tx-seat-${state}`} style={{width:16,height:16,border:'1px solid currentColor'}} aria-hidden="true"/>{state==='disabled'?'Unavailable':state[0].toUpperCase()+state.slice(1)}</span>)}</div>
}

