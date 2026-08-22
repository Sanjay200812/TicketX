import { TicketXTheatre } from '@/types/theatre';

export const theatres: TicketXTheatre[] = [
  // ==========================================
  // 1. GUNTUR THEATRES (10 Theatres)
  // ==========================================
  {
    id: "plateno-cinemas",
    name: "Plateno Cinemas Dolby Atmos 4K Barco Projection",
    locationId: "guntur",
    area: "Collectorate Road",
    address: "Opposite Municipal Office, Guntur",
    status: "available",
    facilities: ["Dolby Atmos", "4K Barco Laser", "Recliner Seats", "Food Court", "Parking"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "pallavi-keerthana-complex",
    name: "Pallavi Keerthana Complex, Sambasiva Pet",
    locationId: "guntur",
    area: "Sambasiva Pet",
    address: "Sambasiva Pet Main Road, Guntur",
    status: "available",
    facilities: ["Dual Screens", "4K Projection", "Air Conditioned", "Parking"],
    format: ["2D", "4K"]
  },
  {
    id: "sri-saraswathi-picture-palace",
    name: "Sri Saraswathi Picture Palace",
    locationId: "guntur",
    area: "Arundelpet",
    address: "Arundelpet 3rd Line, Guntur",
    status: "available",
    facilities: ["DTS Sound", "Classic Balcony", "Snack Bar"],
    format: ["2D"]
  },
  {
    id: "mythri-cinemas",
    name: "Mythri Cinemas, Mythri Mall",
    locationId: "guntur",
    area: "Mythri Mall",
    address: "GT Road, Mythri Mall 4th Floor, Guntur",
    status: "available",
    facilities: ["Multiplex", "Dolby Atmos", "Food Court", "Game Zone", "Valet Parking"],
    format: ["2D", "3D"]
  },
  {
    id: "cine-prime-cinema",
    name: "Cine Prime Cinema, Srinivasarao Pet",
    locationId: "guntur",
    area: "Srinivasarao Pet",
    address: "Near Old Bus Stand, Srinivasarao Pet, Guntur",
    status: "available",
    facilities: ["Digital 4K", "Comfort Seating", "Cafeteria"],
    format: ["2D"]
  },
  {
    id: "bhaskar-cinemas",
    name: "Bhaskar Cinemas",
    locationId: "guntur",
    area: "Brodipet",
    address: "Brodipet 4th Line, Guntur",
    status: "available",
    facilities: ["Dolby Surround 7.1", "Push Back Seats", "Parking"],
    format: ["2D"]
  },
  {
    id: "cine-square",
    name: "Cine Square Dolby Atmos A/C, Gorantla",
    locationId: "guntur",
    area: "Gorantla",
    address: "Gorantla Main Road, Near Inner Ring Road, Guntur",
    status: "available",
    facilities: ["Dolby Atmos", "4K Projection", "Luxury Recliners", "Snack Bar"],
    format: ["2D", "3D"]
  },
  {
    id: "studio-81-cinemas",
    name: "Studio 81 Cinemas, KSP Prime Mall",
    locationId: "guntur",
    area: "KSP Prime Mall",
    address: "KSP Prime Mall 3rd Floor, Koritepadu, Guntur",
    status: "available",
    facilities: ["4K RGB Laser", "Dolby Atmos", "VIP Loungers", "Food Court"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "jle-cinemas",
    name: "JLE Cinemas",
    locationId: "guntur",
    area: "Chandramouli Nagar",
    address: "Ring Road, Chandramouli Nagar, Guntur",
    status: "available",
    facilities: ["Flagship Multiplex", "Dolby Atmos", "Motorized Recliners", "Gourmet Food"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "gs-cinemas",
    name: "GS Cinemas, Near Lilatha Hospital",
    locationId: "guntur",
    area: "Lilatha Hospital Area",
    address: "Near Lilatha Hospital, Collectorate Area, Guntur",
    status: "available",
    facilities: ["4K Digital", "Air Conditioned", "Cafeteria"],
    format: ["2D"]
  },

  // ==========================================
  // 2. VIJAYAWADA THEATRES (10 Theatres)
  // ==========================================
  {
    id: "capital-cinemas",
    name: "Capital Cinemas, Trendset Mall, Kala Nagar",
    locationId: "vijayawada",
    area: "Trendset Mall",
    address: "Trendset Mall 5th Floor, Kala Nagar, Vijayawada",
    status: "available",
    facilities: ["7 Screens", "Dolby Atmos", "4K Laser", "Recliner Lounges", "Food Mall"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "inox-urvasi",
    name: "INOX Urvasi Complex, Gandhi Nagar",
    locationId: "vijayawada",
    area: "Gandhi Nagar",
    address: "Urvasi Complex, Gandhi Nagar, Vijayawada",
    status: "available",
    facilities: ["Multiplex", "Dolby Surround", "In-seat Dining"],
    format: ["2D", "3D"]
  },
  {
    id: "g3-raj-yuvraj",
    name: "G3 Theatres Raj Yuvraj, Gandhi Nagar",
    locationId: "vijayawada",
    area: "Gandhi Nagar",
    address: "Gandhi Nagar Main Road, Vijayawada",
    status: "available",
    facilities: ["Dual Screens", "4K Projection", "Air Conditioned"],
    format: ["2D"]
  },
  {
    id: "cinepolis-pvp",
    name: "Cinepolis PVP Square, Mogalrajapuram",
    locationId: "vijayawada",
    area: "PVP Square Mall",
    address: "PVP Square Mall 4th Floor, MG Road, Mogalrajapuram, Vijayawada",
    status: "available",
    facilities: ["6 Screens", "Dolby Atmos", "VIP Recliners", "Food Court"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "pvr-ripples",
    name: "PVR Ripples Mall, MG Road",
    locationId: "vijayawada",
    area: "MG Road",
    address: "Ripples Mall, MG Road, Vijayawada",
    status: "available",
    facilities: ["PVR Luxury", "Dolby Atmos", "4K Projection", "Cafeteria"],
    format: ["2D", "3D"]
  },
  {
    id: "inox-laila",
    name: "INOX Laila Mall, MG Road",
    locationId: "vijayawada",
    area: "MG Road",
    address: "Laila Mall, MG Road, Vijayawada",
    status: "available",
    facilities: ["Multiplex", "Digital Surround", "Plush Seats"],
    format: ["2D"]
  },
  {
    id: "ravi-cinemas",
    name: "Ravi Cinemas, PNBS",
    locationId: "vijayawada",
    area: "PNBS Area",
    address: "Near PNBS Bus Stand, Vijayawada",
    status: "available",
    facilities: ["Classic Single Screen", "Air Conditioned", "Snack Bar"],
    format: ["2D"]
  },
  {
    id: "tara-screens",
    name: "Tara Screens 2K A/C",
    locationId: "vijayawada",
    area: "Governorpet",
    address: "Governorpet 2nd Street, Vijayawada",
    status: "available",
    facilities: ["2K Digital", "DTS Surround", "Parking"],
    format: ["2D"]
  },
  {
    id: "inox-lepl-icon",
    name: "INOX LEPL Icon, Patamata",
    locationId: "vijayawada",
    area: "Patamata",
    address: "LEPL Icon Mall, MG Road, Patamata, Vijayawada",
    status: "available",
    facilities: ["Insignia VIP", "Dolby Atmos", "Gourmet Menu"],
    format: ["2D", "3D", "4K"]
  },
  {
    id: "cinepolis-power-one",
    name: "Cinepolis Power One Mall, Bunder Road",
    locationId: "vijayawada",
    area: "Bunder Road",
    address: "Power One Mall, Bunder Road, Vijayawada",
    status: "available",
    facilities: ["Dolby Atmos", "Recliner Lounges", "Food Court"],
    format: ["2D", "3D"]
  },

  // ==========================================
  // 3. NARASARAOPETA / NRT THEATRES (4 Theatres)
  // ==========================================
  {
    id: "geetha-multiplex",
    name: "Geetha Multiplex, Kasu Central Mall",
    locationId: "nrt",
    area: "Kasu Central Mall",
    address: "Kasu Central Mall 3rd Floor, Narasaraopet",
    status: "available",
    facilities: ["Multiplex", "Dolby Atmos", "Food Court"],
    format: ["2D", "3D"]
  },
  {
    id: "eswar-mahal-deluxe",
    name: "Eswar Mahal Deluxe, Venkat Reddy Nagar",
    locationId: "nrt",
    area: "Venkat Reddy Nagar",
    address: "Venkat Reddy Nagar Main Road, Narasaraopet",
    status: "available",
    facilities: ["Deluxe Balcony", "DTS Sound"],
    format: ["2D"]
  },
  {
    id: "vijetha-deluxe",
    name: "Vijetha Deluxe",
    locationId: "nrt",
    area: "Station Road",
    address: "Railway Station Road, Narasaraopet",
    status: "available",
    facilities: ["4K Projection", "Air Conditioned"],
    format: ["2D"]
  },
  {
    id: "lakshmi-narasimha",
    name: "Lakshmi Narasimha Delux Theatre, Arundelpet",
    locationId: "nrt",
    area: "Arundelpet",
    address: "Arundelpet Main Road, Narasaraopet",
    status: "available",
    facilities: ["Push Back Seats", "Snack Bar"],
    format: ["2D"]
  },

  // ==========================================
  // 4. SATTENAPALLI THEATRES (2 Theatres)
  // ==========================================
  {
    id: "sri-lakshmi-sattenapalli",
    name: "Sri Lakshmi Talkies 4K Dolby Atmos 3D",
    locationId: "sattenapalli",
    area: "Station Road",
    address: "Station Road, Sattenapalli",
    status: "available",
    facilities: ["Dolby Atmos", "4K Projection", "3D"],
    format: ["2D", "3D"]
  },
  {
    id: "sai-krishna-sattenapalli",
    name: "Sai Krishna 4K Dolby Atmos Ultra HD 3D",
    locationId: "sattenapalli",
    area: "Guntur Road",
    address: "Guntur Road, Sattenapalli",
    status: "available",
    facilities: ["Dolby Atmos", "4K Projection", "3D"],
    format: ["2D", "3D"]
  },

  // ==========================================
  // 5. EDLAPADU THEATRE (1 Theatre)
  // ==========================================
  {
    id: "jayalakshmi-edlapadu",
    name: "Jayalakshmi Theatre, Chennai Highway",
    locationId: "edlapadu",
    area: "Chennai Highway",
    address: "Chennai Highway, Edlapadu",
    status: "available",
    facilities: ["DTS Sound", "Parking"],
    format: ["2D"]
  },

  // ==========================================
  // 6. MARTUR THEATRE (1 Theatre)
  // ==========================================
  {
    id: "nr-cinemas-martur",
    name: "NR Cinemas AC DTS, Martur",
    locationId: "martur",
    area: "Martur Center",
    address: "Main Road, Martur",
    status: "available",
    facilities: ["DTS Surround", "Comfort Seats"],
    format: ["2D"]
  }
];
