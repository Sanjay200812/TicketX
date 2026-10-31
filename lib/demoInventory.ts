import 'server-only';
import { shows } from '@/data/shows';
import { seatLayoutsMap } from '@/data/seatLayouts';
import { bookingDatabase } from './bookingDatabase';
export async function ensureDemoInventory(showId:string){
 const show=shows.find(s=>s.id===showId);if(!show)throw new Error('Unknown demonstration show');
 const layout=seatLayoutsMap[show.theatreId];if(!layout)throw new Error('Auditorium unavailable');
 const records=layout.sections.flatMap(section=>section.rows.flatMap(row=>row.groups.flatMap(group=>group.seats.filter(s=>s.status!=='blocked').map(seat=>({show_id:showId,seat_id:seat.id,price_paise:Math.round((section.price??0)*100),unavailable:section.price===null||seat.status==='disabled'||seat.status==='booked'})))));
 const sql=bookingDatabase();if(records.length)await sql`insert into ticketx.show_seats ${sql(records)} on conflict (show_id,seat_id) do nothing`;
 return {show,layout};
}
