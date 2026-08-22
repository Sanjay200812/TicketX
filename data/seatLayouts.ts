import { TicketXSeatLayout, SeatStatus } from '@/types/seatLayouts';

function makeSeats(startNum: number, count: number, bookedNums: number[] = []) {
  return Array.from({ length: count }, (_, i) => {
    const num = startNum + i;
    const isBooked = bookedNums.includes(num);
    return {
      number: num,
      status: (isBooked ? 'booked' : 'available') as SeatStatus,
    };
  });
}

export const seatLayouts: TicketXSeatLayout[] = [
  // =========================================================================
  // 1. Plateno Cinemas — Guntur (Verified Capacity: 320)
  // Master Prices: Premium ₹80 | Gold ₹120 | On Land ₹777
  // =========================================================================
  {
    id: "layout-plateno-cinemas",
    locationId: "guntur",
    theatreId: "plateno-cinemas",
    theatreName: "Plateno Cinemas Dolby Atmos 4K Barco Projection",
    verifiedCapacity: 320,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Back-Hall Cinema Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [7, 8]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [6, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [8]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 9]), rightSeats: makeSeats(16, 5, [17]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 120,
        description: "Mid-Hall Prime Viewing Area",
        rows: [
          { row: "G", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 10, [9, 10]), rightSeats: makeSeats(17, 6) },
          { row: "H", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10, [8, 11]), rightSeats: makeSeats(17, 6, [19]) },
          { row: "I", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 10, [10, 12]), rightSeats: makeSeats(17, 6) },
          { row: "J", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10), rightSeats: makeSeats(17, 6, [21]) },
          { row: "K", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 11, [9, 13]), rightSeats: makeSeats(18, 6) },
          { row: "L", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11, [8, 10]), rightSeats: makeSeats(18, 6, [20]) },
          { row: "M", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 11, [11, 12]), rightSeats: makeSeats(18, 6) },
          { row: "N", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11), rightSeats: makeSeats(18, 6, [22]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 777,
        description: "Screen-Side Luxury Recliners (Bottom)",
        rows: [
          { row: "O", centerSeats: makeSeats(1, 10, [4, 5]) },
          { row: "P", centerSeats: makeSeats(1, 10, [6, 7]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. Pallavi Keerthana Complex — Guntur (Verified Capacity: 270)
  // Master Prices: Premium ₹80 | Gold ₹110 | On Land ₹567
  // =========================================================================
  {
    id: "layout-pallavi-keerthana-complex",
    locationId: "guntur",
    theatreId: "pallavi-keerthana-complex",
    theatreName: "Pallavi Keerthana Complex, Sambasiva Pet",
    verifiedCapacity: 270,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Balcony / Back Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 10, [3, 4]), rightSeats: makeSeats(11, 10, [15, 16]) },
          { row: "B", leftSeats: makeSeats(1, 10, [2]), rightSeats: makeSeats(11, 10, [17]) },
          { row: "C", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [14]) },
          { row: "D", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 10, [18]) },
          { row: "E", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [19]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 110,
        description: "Main Hall Center View",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 11, [1]), rightSeats: makeSeats(12, 11, [20]) },
          { row: "K", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [14, 21]) },
          { row: "L", leftSeats: makeSeats(1, 11, [6]), rightSeats: makeSeats(12, 11) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 567,
        description: "Front-Row Luxury Recliners (Bottom)",
        rows: [
          { row: "M", centerSeats: makeSeats(1, 8, [3, 4]) },
          { row: "N", centerSeats: makeSeats(1, 8, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. Sri Saraswathi Picture Palace — Guntur (Verified Capacity: 220)
  // Master Prices: Premium ₹80 | Gold ₹105 | On Land ₹499
  // =========================================================================
  {
    id: "layout-sri-saraswathi-picture-palace",
    locationId: "guntur",
    theatreId: "sri-saraswathi-picture-palace",
    theatreName: "Sri Saraswathi Picture Palace",
    verifiedCapacity: 220,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Upper Balcony Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [14]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 9, [1]), rightSeats: makeSeats(10, 9, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 105,
        description: "Main Hall Center Block",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 10, [4]), rightSeats: makeSeats(11, 10, [13, 14]) },
          { row: "G", leftSeats: makeSeats(1, 10, [2, 3]), rightSeats: makeSeats(11, 10, [15]) },
          { row: "H", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [12, 16]) },
          { row: "I", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 10) },
          { row: "J", leftSeats: makeSeats(1, 9, [1]), rightSeats: makeSeats(10, 10, [14, 17]) },
          { row: "K", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 10, [11, 18]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 499,
        description: "Front-Row Luxury Seating (Bottom)",
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. Mythri Cinemas — Guntur (Verified Capacity: 380)
  // Master Prices: Premium ₹85 | Gold ₹140 | On Land ₹999
  // =========================================================================
  {
    id: "layout-mythri-cinemas",
    locationId: "guntur",
    theatreId: "mythri-cinemas",
    theatreName: "Mythri Cinemas, Mythri Mall",
    verifiedCapacity: 380,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 85,
        description: "Back-Hall Cinema Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 140,
        description: "Mid-Hall Prime Viewing Seats",
        rows: [
          { row: "H", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 12, [10, 11]), rightSeats: makeSeats(19, 6) },
          { row: "I", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [9, 13]), rightSeats: makeSeats(19, 6, [22]) },
          { row: "J", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 12, [11, 14]), rightSeats: makeSeats(19, 6) },
          { row: "K", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6, [23]) },
          { row: "L", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 12, [8, 15]), rightSeats: makeSeats(19, 6) },
          { row: "M", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [10, 12]), rightSeats: makeSeats(19, 6, [21]) },
          { row: "N", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6) },
          { row: "O", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [9, 14]), rightSeats: makeSeats(19, 6, [24]) },
          { row: "P", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 999,
        description: "Luxury Screen-Front Recliners (Bottom)",
        rows: [
          { row: "Q", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "R", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. Cine Prime Cinema — Guntur (Verified Capacity: 250)
  // Master Prices: Premium ₹80 | Gold ₹115 | On Land ₹669
  // =========================================================================
  {
    id: "layout-cine-prime-cinema",
    locationId: "guntur",
    theatreId: "cine-prime-cinema",
    theatreName: "Cine Prime Cinema, Srinivasarao Pet",
    verifiedCapacity: 250,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Upper Hall Comfort Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 4, [2]), centerSeats: makeSeats(5, 10, [7, 8]), rightSeats: makeSeats(15, 4) },
          { row: "B", leftSeats: makeSeats(1, 4), centerSeats: makeSeats(5, 10, [6, 9]), rightSeats: makeSeats(15, 4, [17]) },
          { row: "C", leftSeats: makeSeats(1, 4, [3]), centerSeats: makeSeats(5, 10, [8, 10]), rightSeats: makeSeats(15, 4) },
          { row: "D", leftSeats: makeSeats(1, 4), centerSeats: makeSeats(5, 10), rightSeats: makeSeats(15, 4, [18]) },
          { row: "E", leftSeats: makeSeats(1, 4, [1]), centerSeats: makeSeats(5, 10, [7, 9]), rightSeats: makeSeats(15, 4) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 115,
        description: "Center Hall Prime View",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 11, [8, 9]), rightSeats: makeSeats(17, 5) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 11, [7, 10]), rightSeats: makeSeats(17, 5, [19]) },
          { row: "H", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 11, [9, 12]), rightSeats: makeSeats(17, 5) },
          { row: "I", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 11), rightSeats: makeSeats(17, 5, [20]) },
          { row: "J", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 11, [8, 10]), rightSeats: makeSeats(17, 5) },
          { row: "K", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 9]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "L", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 669,
        description: "Front Screen-Side Recliners (Bottom)",
        rows: [
          { row: "M", centerSeats: makeSeats(1, 8, [3, 4]) },
          { row: "N", centerSeats: makeSeats(1, 8, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. Bhaskar Cinemas — Guntur (Verified Capacity: 230)
  // Master Prices: Premium ₹80 | Gold ₹105 | On Land ₹555
  // =========================================================================
  {
    id: "layout-bhaskar-cinemas",
    locationId: "guntur",
    theatreId: "bhaskar-cinemas",
    theatreName: "Bhaskar Cinemas",
    verifiedCapacity: 230,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Upper Tier Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [13, 14]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [15]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [12, 16]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [14]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 105,
        description: "Main Hall Center Block",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [14, 20]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [13, 18]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 555,
        description: "Front Screen-Facing Lounger (Bottom)",
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [4, 5]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 7. Cine Square — Guntur (Verified Capacity: 210)
  // Master Prices: Premium ₹80 | Gold ₹125 | On Land ₹699
  // =========================================================================
  {
    id: "layout-cine-square",
    locationId: "guntur",
    theatreId: "cine-square",
    theatreName: "Cine Square Dolby Atmos A/C, Gorantla",
    verifiedCapacity: 210,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Upper Dolby Surround Tier (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 8, [3]), rightSeats: makeSeats(9, 8, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 8, [2, 4]), rightSeats: makeSeats(9, 8, [14]) },
          { row: "C", leftSeats: makeSeats(1, 8), rightSeats: makeSeats(9, 8, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 8, [5]), rightSeats: makeSeats(9, 8) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 125,
        description: "Immersive Sound Center Section",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 10, [14, 15]) },
          { row: "G", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 10, [16]) },
          { row: "H", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 10, [13, 17]) },
          { row: "I", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 10) },
          { row: "J", leftSeats: makeSeats(1, 9, [1]), rightSeats: makeSeats(10, 10, [18]) },
          { row: "K", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 10, [12]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 699,
        description: "Atmos Front Luxury Recliners (Bottom)",
        rows: [
          { row: "L", centerSeats: makeSeats(1, 8, [3, 4]) },
          { row: "M", centerSeats: makeSeats(1, 8, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 8. Studio 81 Cinemas — Guntur (Verified Capacity: 420)
  // Master Prices: Premium ₹90 | Gold ₹150 | On Land ₹1,116
  // =========================================================================
  {
    id: "layout-studio-81-cinemas",
    locationId: "guntur",
    theatreId: "studio-81-cinemas",
    theatreName: "Studio 81 Cinemas, KSP Prime Mall",
    verifiedCapacity: 420,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 90,
        description: "Multiplex Back Tier (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
          { row: "H", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9]), rightSeats: makeSeats(16, 5, [20]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 150,
        description: "Studio Ergonomic Center Seats",
        rows: [
          { row: "I", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [11, 12]), rightSeats: makeSeats(20, 7) },
          { row: "J", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 14]), rightSeats: makeSeats(20, 7, [24]) },
          { row: "K", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [12, 15]), rightSeats: makeSeats(20, 7) },
          { row: "L", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [25]) },
          { row: "M", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [9, 16]), rightSeats: makeSeats(20, 7) },
          { row: "N", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [11, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "O", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "P", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 15]), rightSeats: makeSeats(20, 7, [26]) },
          { row: "Q", leftSeats: makeSeats(1, 7, [5]), centerSeats: makeSeats(8, 13, [12, 14]), rightSeats: makeSeats(21, 7) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1116,
        description: "Ultra-VIP Motorized Recliners (Bottom)",
        rows: [
          { row: "R", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "S", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 9. JLE Cinemas — Guntur (Verified Capacity: 370)
  // Master Prices: Premium ₹85 | Gold ₹145 | On Land ₹888
  // =========================================================================
  {
    id: "layout-jle-cinemas",
    locationId: "guntur",
    theatreId: "jle-cinemas",
    theatreName: "JLE Cinemas",
    verifiedCapacity: 370,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 85,
        description: "Grand Multiplex Upper Tier (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 145,
        description: "Prime Central Auditorium Block",
        rows: [
          { row: "H", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [10, 11]), rightSeats: makeSeats(20, 7) },
          { row: "I", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "J", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [11, 14]), rightSeats: makeSeats(20, 7) },
          { row: "K", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [24]) },
          { row: "L", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [8, 15]), rightSeats: makeSeats(20, 7) },
          { row: "M", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 12]), rightSeats: makeSeats(20, 7, [22]) },
          { row: "N", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "O", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 14]), rightSeats: makeSeats(20, 7, [25]) },
          { row: "P", leftSeats: makeSeats(1, 7, [5]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 888,
        description: "Flagship Luxury Lounger Seats (Bottom)",
        rows: [
          { row: "Q", centerSeats: makeSeats(1, 11, [4, 5, 8]) },
          { row: "R", centerSeats: makeSeats(1, 11, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 10. GS Cinemas — Guntur (Verified Capacity: 220)
  // Master Prices: Premium ₹80 | Gold ₹100 | On Land ₹505
  // =========================================================================
  {
    id: "layout-gs-cinemas",
    locationId: "guntur",
    theatreId: "gs-cinemas",
    theatreName: "GS Cinemas, Near Lilatha Hospital",
    verifiedCapacity: 220,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        description: "Upper Section Comfort Seating (Top)",
        rows: [
          { row: "A", leftSeats: makeSeats(1, 8, [2]), rightSeats: makeSeats(9, 8, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 8, [3]), rightSeats: makeSeats(9, 8, [14]) },
          { row: "C", leftSeats: makeSeats(1, 8), rightSeats: makeSeats(9, 8, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 8, [4]), rightSeats: makeSeats(9, 8) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 100,
        description: "Main Hall Center Section",
        rows: [
          { row: "F", leftSeats: makeSeats(1, 10, [3, 4]), rightSeats: makeSeats(11, 11, [15, 16]) },
          { row: "G", leftSeats: makeSeats(1, 10, [2]), rightSeats: makeSeats(11, 11, [17]) },
          { row: "H", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [14, 18]) },
          { row: "I", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 11, [19]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [13]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 505,
        description: "Front Screen-Side Recliners (Bottom)",
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 11. Capital Cinemas — Vijayawada (Verified Capacity: 420)
  // Master Prices: Premium ₹90 | Gold ₹150 | On Land ₹1,111
  // =========================================================================
  {
    id: "layout-capital-cinemas",
    locationId: "vijayawada",
    theatreId: "capital-cinemas",
    theatreName: "Capital Cinemas, Trendset Mall, Kala Nagar",
    verifiedCapacity: 420,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 90,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [6, 11]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9]), rightSeats: makeSeats(16, 5) },
          { row: "H", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [20]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 150,
        rows: [
          { row: "I", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [10, 11]), rightSeats: makeSeats(20, 7) },
          { row: "J", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "K", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [11, 14]), rightSeats: makeSeats(20, 7) },
          { row: "L", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [24]) },
          { row: "M", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [8, 15]), rightSeats: makeSeats(20, 7) },
          { row: "N", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 12]), rightSeats: makeSeats(20, 7, [22]) },
          { row: "O", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "P", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 14]), rightSeats: makeSeats(20, 7, [25]) },
          { row: "Q", leftSeats: makeSeats(1, 7, [5]), centerSeats: makeSeats(8, 13, [12, 14]), rightSeats: makeSeats(21, 7) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1111,
        rows: [
          { row: "R", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "S", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 12. INOX Urvasi Complex — Vijayawada (Verified Capacity: 340)
  // Master Prices: Premium ₹85 | Gold ₹135 | On Land ₹808
  // =========================================================================
  {
    id: "layout-inox-urvasi",
    locationId: "vijayawada",
    theatreId: "inox-urvasi",
    theatreName: "INOX Urvasi Complex, Gandhi Nagar",
    verifiedCapacity: 340,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 85,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 135,
        rows: [
          { row: "G", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 11, [9, 10]), rightSeats: makeSeats(18, 6) },
          { row: "H", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11, [8, 11]), rightSeats: makeSeats(18, 6, [19]) },
          { row: "I", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 11, [10, 12]), rightSeats: makeSeats(18, 6) },
          { row: "J", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11), rightSeats: makeSeats(18, 6, [21]) },
          { row: "K", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 11, [9, 13]), rightSeats: makeSeats(18, 6) },
          { row: "L", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11, [8, 10]), rightSeats: makeSeats(18, 6, [20]) },
          { row: "M", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 11, [11, 12]), rightSeats: makeSeats(18, 6) },
          { row: "N", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11), rightSeats: makeSeats(18, 6, [22]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 808,
        rows: [
          { row: "O", centerSeats: makeSeats(1, 10, [4, 5]) },
          { row: "P", centerSeats: makeSeats(1, 10, [6, 7]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 13. G3 Theatres Raj Yuvraj — Vijayawada (Verified Capacity: 300)
  // Master Prices: Premium ₹80 | Gold ₹120 | On Land ₹707
  // =========================================================================
  {
    id: "layout-g3-raj-yuvraj",
    locationId: "vijayawada",
    theatreId: "g3-raj-yuvraj",
    theatreName: "G3 Theatres Raj Yuvraj, Gandhi Nagar",
    verifiedCapacity: 300,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 120,
        rows: [
          { row: "G", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 10, [9, 10]), rightSeats: makeSeats(17, 6) },
          { row: "H", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10, [8, 11]), rightSeats: makeSeats(17, 6, [19]) },
          { row: "I", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 10, [10, 12]), rightSeats: makeSeats(17, 6) },
          { row: "J", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10), rightSeats: makeSeats(17, 6, [21]) },
          { row: "K", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 10, [9, 13]), rightSeats: makeSeats(17, 6) },
          { row: "L", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10, [8, 10]), rightSeats: makeSeats(17, 6, [20]) },
          { row: "M", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 10, [11, 12]), rightSeats: makeSeats(17, 6) },
          { row: "N", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10), rightSeats: makeSeats(17, 6, [22]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 707,
        rows: [
          { row: "O", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "P", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 14. Cinepolis PVP Square — Vijayawada (Verified Capacity: 420)
  // Master Prices: Premium ₹90 | Gold ₹150 | On Land ₹1,199
  // =========================================================================
  {
    id: "layout-cinepolis-pvp",
    locationId: "vijayawada",
    theatreId: "cinepolis-pvp",
    theatreName: "Cinepolis PVP Square, Mogalrajapuram",
    verifiedCapacity: 420,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 90,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [6, 11]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9]), rightSeats: makeSeats(16, 5) },
          { row: "H", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [20]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 150,
        rows: [
          { row: "I", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [10, 11]), rightSeats: makeSeats(20, 7) },
          { row: "J", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "K", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [11, 14]), rightSeats: makeSeats(20, 7) },
          { row: "L", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [24]) },
          { row: "M", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [8, 15]), rightSeats: makeSeats(20, 7) },
          { row: "N", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 12]), rightSeats: makeSeats(20, 7, [22]) },
          { row: "O", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "P", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 14]), rightSeats: makeSeats(20, 7, [25]) },
          { row: "Q", leftSeats: makeSeats(1, 7, [5]), centerSeats: makeSeats(8, 13, [12, 14]), rightSeats: makeSeats(21, 7) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1199,
        rows: [
          { row: "R", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "S", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 15. PVR Ripples Mall — Vijayawada (Verified Capacity: 380)
  // Master Prices: Premium ₹85 | Gold ₹140 | On Land ₹1,009
  // =========================================================================
  {
    id: "layout-pvr-ripples",
    locationId: "vijayawada",
    theatreId: "pvr-ripples",
    theatreName: "PVR Ripples Mall, MG Road",
    verifiedCapacity: 380,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 85,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 140,
        rows: [
          { row: "H", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 12, [10, 11]), rightSeats: makeSeats(19, 6) },
          { row: "I", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [9, 13]), rightSeats: makeSeats(19, 6, [22]) },
          { row: "J", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 12, [11, 14]), rightSeats: makeSeats(19, 6) },
          { row: "K", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6, [23]) },
          { row: "L", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 12, [8, 15]), rightSeats: makeSeats(19, 6) },
          { row: "M", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [10, 12]), rightSeats: makeSeats(19, 6, [21]) },
          { row: "N", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6) },
          { row: "O", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12, [9, 14]), rightSeats: makeSeats(19, 6, [24]) },
          { row: "P", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1009,
        rows: [
          { row: "Q", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "R", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 16. INOX Laila Mall — Vijayawada (Verified Capacity: 350)
  // Master Prices: Premium ₹85 | Gold ₹135 | On Land ₹888
  // =========================================================================
  {
    id: "layout-inox-laila",
    locationId: "vijayawada",
    theatreId: "inox-laila",
    theatreName: "INOX Laila Mall, MG Road",
    verifiedCapacity: 350,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 85,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 135,
        rows: [
          { row: "G", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 11, [9, 10]), rightSeats: makeSeats(18, 6) },
          { row: "H", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11, [8, 11]), rightSeats: makeSeats(18, 6, [19]) },
          { row: "I", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 11, [10, 12]), rightSeats: makeSeats(18, 6) },
          { row: "J", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11), rightSeats: makeSeats(18, 6, [21]) },
          { row: "K", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 11, [9, 13]), rightSeats: makeSeats(18, 6) },
          { row: "L", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 11, [8, 10]), rightSeats: makeSeats(18, 6, [20]) },
          { row: "M", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 11, [11, 12]), rightSeats: makeSeats(18, 6) },
          { row: "N", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 12), rightSeats: makeSeats(19, 6) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 888,
        rows: [
          { row: "O", centerSeats: makeSeats(1, 10, [4, 5]) },
          { row: "P", centerSeats: makeSeats(1, 10, [6, 7]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 17. Ravi Cinemas — Vijayawada (Verified Capacity: 260)
  // Master Prices: Premium ₹80 | Gold ₹110 | On Land ₹555
  // =========================================================================
  {
    id: "layout-ravi-cinemas",
    locationId: "vijayawada",
    theatreId: "ravi-cinemas",
    theatreName: "Ravi Cinemas, PNBS",
    verifiedCapacity: 260,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 10, [3, 4]), rightSeats: makeSeats(11, 10, [15, 16]) },
          { row: "B", leftSeats: makeSeats(1, 10, [2]), rightSeats: makeSeats(11, 10, [17]) },
          { row: "C", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [14]) },
          { row: "D", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 10, [18]) },
          { row: "E", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [19]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 110,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 10, [4]), rightSeats: makeSeats(11, 10, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 10, [2, 3]), rightSeats: makeSeats(11, 10, [18]) },
          { row: "H", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 10) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [20]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [14, 21]) },
          { row: "L", leftSeats: makeSeats(1, 10, [6]), rightSeats: makeSeats(11, 10) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 555,
        rows: [
          { row: "M", centerSeats: makeSeats(1, 10, [3, 4]) },
          { row: "N", centerSeats: makeSeats(1, 10, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 18. Tara Screens 2K A/C — Vijayawada (Verified Capacity: 240)
  // Master Prices: Premium ₹80 | Gold ₹110 | On Land ₹505
  // =========================================================================
  {
    id: "layout-tara-screens",
    locationId: "vijayawada",
    theatreId: "tara-screens",
    theatreName: "Tara Screens 2K A/C",
    verifiedCapacity: 240,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [14]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 9, [1]), rightSeats: makeSeats(10, 9, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 110,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 11, [1]), rightSeats: makeSeats(12, 11, [20]) },
          { row: "K", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [14, 21]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 505,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 10, [3, 4]) },
          { row: "M", centerSeats: makeSeats(1, 10, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 19. INOX LEPL Icon — Vijayawada (Verified Capacity: 400)
  // Master Prices: Premium ₹90 | Gold ₹150 | On Land ₹1,116
  // =========================================================================
  {
    id: "layout-inox-lepl-icon",
    locationId: "vijayawada",
    theatreId: "inox-lepl-icon",
    theatreName: "INOX LEPL Icon, Patamata",
    verifiedCapacity: 400,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 90,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [6, 11]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9]), rightSeats: makeSeats(16, 5) },
          { row: "H", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [20]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 150,
        rows: [
          { row: "I", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [10, 11]), rightSeats: makeSeats(20, 7) },
          { row: "J", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "K", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [11, 14]), rightSeats: makeSeats(20, 7) },
          { row: "L", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [24]) },
          { row: "M", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [8, 15]), rightSeats: makeSeats(20, 7) },
          { row: "N", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 12]), rightSeats: makeSeats(20, 7, [22]) },
          { row: "O", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "P", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 14]), rightSeats: makeSeats(20, 7, [25]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1116,
        rows: [
          { row: "Q", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "R", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 20. Cinepolis Power One Mall — Vijayawada (Verified Capacity: 420)
  // Master Prices: Premium ₹90 | Gold ₹150 | On Land ₹1,111
  // =========================================================================
  {
    id: "layout-cinepolis-power-one",
    locationId: "vijayawada",
    theatreId: "cinepolis-power-one",
    theatreName: "Cinepolis Power One Mall, Bunder Road",
    verifiedCapacity: 420,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 90,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [6, 11]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [17]) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [9]), rightSeats: makeSeats(16, 5) },
          { row: "H", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [20]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 150,
        rows: [
          { row: "I", leftSeats: makeSeats(1, 7, [2]), centerSeats: makeSeats(8, 12, [10, 11]), rightSeats: makeSeats(20, 7) },
          { row: "J", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 13]), rightSeats: makeSeats(20, 7, [23]) },
          { row: "K", leftSeats: makeSeats(1, 7, [3]), centerSeats: makeSeats(8, 12, [11, 14]), rightSeats: makeSeats(20, 7) },
          { row: "L", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7, [24]) },
          { row: "M", leftSeats: makeSeats(1, 7, [1]), centerSeats: makeSeats(8, 12, [8, 15]), rightSeats: makeSeats(20, 7) },
          { row: "N", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [10, 12]), rightSeats: makeSeats(20, 7, [22]) },
          { row: "O", leftSeats: makeSeats(1, 7, [4]), centerSeats: makeSeats(8, 12), rightSeats: makeSeats(20, 7) },
          { row: "P", leftSeats: makeSeats(1, 7), centerSeats: makeSeats(8, 12, [9, 14]), rightSeats: makeSeats(20, 7, [25]) },
          { row: "Q", leftSeats: makeSeats(1, 7, [5]), centerSeats: makeSeats(8, 13, [12, 14]), rightSeats: makeSeats(21, 7) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 1111,
        rows: [
          { row: "R", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "S", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 21. Geetha Multiplex — Narasaraopeta / NRT (Verified Capacity: 300)
  // Master Prices: Premium ₹80 | Gold ₹130 | On Land ₹707
  // =========================================================================
  {
    id: "layout-geetha-multiplex",
    locationId: "nrt",
    theatreId: "geetha-multiplex",
    theatreName: "Geetha Multiplex, Kasu Central Mall",
    verifiedCapacity: 300,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 10, [8, 9]), rightSeats: makeSeats(16, 5) },
          { row: "B", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 10]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "C", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 10, [9, 11]), rightSeats: makeSeats(16, 5) },
          { row: "D", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5, [19]) },
          { row: "E", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 10, [6, 12]), rightSeats: makeSeats(16, 5) },
          { row: "F", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [8, 10]), rightSeats: makeSeats(16, 5, [17]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 130,
        rows: [
          { row: "G", leftSeats: makeSeats(1, 6, [2]), centerSeats: makeSeats(7, 10, [9, 10]), rightSeats: makeSeats(17, 6) },
          { row: "H", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10, [8, 11]), rightSeats: makeSeats(17, 6, [19]) },
          { row: "I", leftSeats: makeSeats(1, 6, [4]), centerSeats: makeSeats(7, 10, [10, 12]), rightSeats: makeSeats(17, 6) },
          { row: "J", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10), rightSeats: makeSeats(17, 6, [21]) },
          { row: "K", leftSeats: makeSeats(1, 6, [3]), centerSeats: makeSeats(7, 10, [9, 13]), rightSeats: makeSeats(17, 6) },
          { row: "L", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10, [8, 10]), rightSeats: makeSeats(17, 6, [20]) },
          { row: "M", leftSeats: makeSeats(1, 6, [1]), centerSeats: makeSeats(7, 10, [11, 12]), rightSeats: makeSeats(17, 6) },
          { row: "N", leftSeats: makeSeats(1, 6), centerSeats: makeSeats(7, 10), rightSeats: makeSeats(17, 6, [22]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 707,
        rows: [
          { row: "O", centerSeats: makeSeats(1, 12, [4, 5, 8]) },
          { row: "P", centerSeats: makeSeats(1, 12, [6, 7, 9]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 22. Eswar Mahal Deluxe — NRT (Verified Capacity: 240)
  // Master Prices: Premium ₹80 | Gold ₹110 | On Land ₹555
  // =========================================================================
  {
    id: "layout-eswar-mahal-deluxe",
    locationId: "nrt",
    theatreId: "eswar-mahal-deluxe",
    theatreName: "Eswar Mahal Deluxe, Venkat Reddy Nagar",
    verifiedCapacity: 240,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [14]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 9, [1]), rightSeats: makeSeats(10, 9, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 110,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 11, [1]), rightSeats: makeSeats(12, 11, [20]) },
          { row: "K", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [14, 21]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 555,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 10, [3, 4]) },
          { row: "M", centerSeats: makeSeats(1, 10, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 23. Vijetha Deluxe — NRT (Verified Capacity: 230)
  // Master Prices: Premium ₹80 | Gold ₹105 | On Land ₹499
  // =========================================================================
  {
    id: "layout-vijetha-deluxe",
    locationId: "nrt",
    theatreId: "vijetha-deluxe",
    theatreName: "Vijetha Deluxe",
    verifiedCapacity: 230,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [13, 14]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [15]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [12, 16]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [14]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 105,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [14, 20]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [13, 18]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 499,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [4, 5]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 24. Lakshmi Narasimha Delux Theatre — NRT (Verified Capacity: 230)
  // Master Prices: Premium ₹80 | Gold ₹105 | On Land ₹499
  // =========================================================================
  {
    id: "layout-lakshmi-narasimha",
    locationId: "nrt",
    theatreId: "lakshmi-narasimha",
    theatreName: "Lakshmi Narasimha Delux Theatre, Arundelpet",
    verifiedCapacity: 230,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [13, 14]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [15]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [12, 16]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [14]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 105,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [14, 20]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [13, 18]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 499,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [4, 5]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 25. Sri Lakshmi Talkies — Sattenapalli (Verified Capacity: 230)
  // Master Prices: Premium ₹80 | Gold ₹110 | On Land ₹555
  // =========================================================================
  {
    id: "layout-sri-lakshmi-sattenapalli",
    locationId: "sattenapalli",
    theatreId: "sri-lakshmi-sattenapalli",
    theatreName: "Sri Lakshmi Talkies 4K Dolby Atmos 3D",
    verifiedCapacity: 230,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 9, [3, 4]), rightSeats: makeSeats(10, 9, [13, 14]) },
          { row: "B", leftSeats: makeSeats(1, 9, [2]), rightSeats: makeSeats(10, 9, [15]) },
          { row: "C", leftSeats: makeSeats(1, 9), rightSeats: makeSeats(10, 9, [12, 16]) },
          { row: "D", leftSeats: makeSeats(1, 9, [5]), rightSeats: makeSeats(10, 9) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [14]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 110,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 11, [4]), rightSeats: makeSeats(12, 11, [16, 17]) },
          { row: "G", leftSeats: makeSeats(1, 11, [2, 3]), rightSeats: makeSeats(12, 11, [18]) },
          { row: "H", leftSeats: makeSeats(1, 11), rightSeats: makeSeats(12, 11, [15, 19]) },
          { row: "I", leftSeats: makeSeats(1, 11, [5]), rightSeats: makeSeats(12, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 10, [14, 20]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 10, [13, 18]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 555,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [4, 5]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 26. Sai Krishna — Sattenapalli (Verified Capacity: 250)
  // Master Prices: Premium ₹80 | Gold ₹115 | On Land ₹669
  // =========================================================================
  {
    id: "layout-sai-krishna-sattenapalli",
    locationId: "sattenapalli",
    theatreId: "sai-krishna-sattenapalli",
    theatreName: "Sai Krishna 4K Dolby Atmos Ultra HD 3D",
    verifiedCapacity: 250,
    layoutFamily: "Group A",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 4, [2]), centerSeats: makeSeats(5, 10, [7, 8]), rightSeats: makeSeats(15, 4) },
          { row: "B", leftSeats: makeSeats(1, 4), centerSeats: makeSeats(5, 10, [6, 9]), rightSeats: makeSeats(15, 4, [17]) },
          { row: "C", leftSeats: makeSeats(1, 4, [3]), centerSeats: makeSeats(5, 10, [8, 10]), rightSeats: makeSeats(15, 4) },
          { row: "D", leftSeats: makeSeats(1, 4), centerSeats: makeSeats(5, 10), rightSeats: makeSeats(15, 4, [18]) },
          { row: "E", leftSeats: makeSeats(1, 4, [1]), centerSeats: makeSeats(5, 10, [7, 9]), rightSeats: makeSeats(15, 4) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 115,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 5, [2]), centerSeats: makeSeats(6, 11, [8, 9]), rightSeats: makeSeats(17, 5) },
          { row: "G", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 11, [7, 10]), rightSeats: makeSeats(17, 5, [19]) },
          { row: "H", leftSeats: makeSeats(1, 5, [3]), centerSeats: makeSeats(6, 11, [9, 12]), rightSeats: makeSeats(17, 5) },
          { row: "I", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 11), rightSeats: makeSeats(17, 5, [20]) },
          { row: "J", leftSeats: makeSeats(1, 5, [1]), centerSeats: makeSeats(6, 11, [8, 10]), rightSeats: makeSeats(17, 5) },
          { row: "K", leftSeats: makeSeats(1, 5), centerSeats: makeSeats(6, 10, [7, 9]), rightSeats: makeSeats(16, 5, [18]) },
          { row: "L", leftSeats: makeSeats(1, 5, [4]), centerSeats: makeSeats(6, 10), rightSeats: makeSeats(16, 5) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 669,
        rows: [
          { row: "M", centerSeats: makeSeats(1, 8, [3, 4]) },
          { row: "N", centerSeats: makeSeats(1, 8, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 27. Jayalakshmi Theatre — Edlapadu (Verified Capacity: 220)
  // Master Prices: Premium ₹80 | Gold ₹100 | On Land ₹499
  // =========================================================================
  {
    id: "layout-jayalakshmi-edlapadu",
    locationId: "edlapadu",
    theatreId: "jayalakshmi-edlapadu",
    theatreName: "Jayalakshmi Theatre, Chennai Highway",
    verifiedCapacity: 220,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 8, [2]), rightSeats: makeSeats(9, 8, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 8, [3]), rightSeats: makeSeats(9, 8, [14]) },
          { row: "C", leftSeats: makeSeats(1, 8), rightSeats: makeSeats(9, 8, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 8, [4]), rightSeats: makeSeats(9, 8) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 100,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 10, [3, 4]), rightSeats: makeSeats(11, 11, [15, 16]) },
          { row: "G", leftSeats: makeSeats(1, 10, [2]), rightSeats: makeSeats(11, 11, [17]) },
          { row: "H", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [14, 18]) },
          { row: "I", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 11, [19]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [13]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 499,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [5, 6]) },
        ],
      },
    ],
  },

  // =========================================================================
  // 28. NR Cinemas — Martur (Verified Capacity: 220)
  // Master Prices: Premium ₹80 | Gold ₹105 | On Land ₹505
  // =========================================================================
  {
    id: "layout-nr-cinemas-martur",
    locationId: "martur",
    theatreId: "nr-cinemas-martur",
    theatreName: "NR Cinemas AC DTS, Martur",
    verifiedCapacity: 220,
    layoutFamily: "Group B",
    screenPosition: "bottom",
    sections: [
      {
        id: "sec-premium",
        categoryKey: "premium",
        name: "Premium Class",
        price: 80,
        rows: [
          { row: "A", leftSeats: makeSeats(1, 8, [2]), rightSeats: makeSeats(9, 8, [12, 13]) },
          { row: "B", leftSeats: makeSeats(1, 8, [3]), rightSeats: makeSeats(9, 8, [14]) },
          { row: "C", leftSeats: makeSeats(1, 8), rightSeats: makeSeats(9, 8, [11, 15]) },
          { row: "D", leftSeats: makeSeats(1, 8, [4]), rightSeats: makeSeats(9, 8) },
          { row: "E", leftSeats: makeSeats(1, 8, [1]), rightSeats: makeSeats(9, 8, [16]) },
        ],
      },
      {
        id: "sec-gold",
        categoryKey: "gold",
        name: "Gold Class",
        price: 105,
        rows: [
          { row: "F", leftSeats: makeSeats(1, 10, [3, 4]), rightSeats: makeSeats(11, 11, [15, 16]) },
          { row: "G", leftSeats: makeSeats(1, 10, [2]), rightSeats: makeSeats(11, 11, [17]) },
          { row: "H", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [14, 18]) },
          { row: "I", leftSeats: makeSeats(1, 10, [5]), rightSeats: makeSeats(11, 11) },
          { row: "J", leftSeats: makeSeats(1, 10, [1]), rightSeats: makeSeats(11, 11, [19]) },
          { row: "K", leftSeats: makeSeats(1, 10), rightSeats: makeSeats(11, 11, [13]) },
        ],
      },
      {
        id: "sec-onland",
        categoryKey: "onLand",
        name: "On Land Luxury Recliner",
        price: 505,
        rows: [
          { row: "L", centerSeats: makeSeats(1, 7, [2, 3]) },
          { row: "M", centerSeats: makeSeats(1, 7, [5, 6]) },
        ],
      },
    ],
  }
];
