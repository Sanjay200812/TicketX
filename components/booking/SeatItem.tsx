"use client";
import { Seat as SeatType } from '@/types/seat';
export function SeatItem({seat,isSelected,onSelect}: {seat:SeatType;isSelected:boolean;onSelect:(seat:SeatType)=>void;isEvent?:boolean}) {
 if(seat.status==='blocked') return <span className="inline-block w-10 h-11" aria-hidden="true"/>;
 const disabled=['held','booked','disabled'].includes(seat.status);
 const state=disabled?seat.status:isSelected?'selected':'available';
 return <button type="button" disabled={disabled} aria-pressed={!disabled&&isSelected} aria-label={`${seat.id}, ${seat.category}, ₹${seat.price}, ${state}`} title={`${seat.id} · ${seat.category} · ₹${seat.price} · ${state}`} onClick={()=>onSelect(seat)} className={`tx-seat tx-seat-${state}`}><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 27V10Q10 5 15 5H25Q30 5 30 10V27M6 18V31Q6 35 11 35H29Q34 35 34 31V18M10 27H30M11 35V38M29 35V38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg><span>{seat.number}</span></button>;
}
