import { TicketXLocation } from '@/types/location';

export const locations: TicketXLocation[] = [
  // ==========================================
  // AVAILABLE TO BOOK CITIES (7 Active Cities)
  // ==========================================
  {
    id: "guntur",
    name: "Guntur",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true,
    isPopular: true
  },
  {
    id: "vijayawada",
    name: "Vijayawada",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true,
    isPopular: true
  },
  {
    id: "nrt",
    name: "Narasaraopeta",
    shortName: "NRT",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true,
    isPopular: true
  },
  {
    id: "sattenapalli",
    name: "Sattenapalli",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true
  },
  {
    id: "edlapadu",
    name: "Edlapadu",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true
  },
  {
    id: "martur",
    name: "Martur",
    state: "Andhra Pradesh",
    country: "India",
    bookingEnabled: true
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    country: "India",
    bookingEnabled: true,
    isPopular: true,
    isEventOnly: true
  },

  // ==========================================
  // INDIA-WIDE CITIES (Coming Soon)
  // ==========================================
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", country: "India", bookingEnabled: false, isPopular: true },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", country: "India", bookingEnabled: false, isPopular: true },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", country: "India", bookingEnabled: false, isPopular: true },
  { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi", country: "India", bookingEnabled: false, isPopular: true },
  { id: "pune", name: "Pune", state: "Maharashtra", country: "India", bookingEnabled: false, isPopular: true },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", country: "India", bookingEnabled: false, isPopular: true },
  { id: "kochi", name: "Kochi", state: "Kerala", country: "India", bookingEnabled: false, isPopular: true },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", country: "India", bookingEnabled: false, isPopular: true },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", country: "India", bookingEnabled: false, isPopular: true },
  { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", country: "India", bookingEnabled: false },
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", country: "India", bookingEnabled: false, isPopular: true },
  { id: "tirupati", name: "Tirupati", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "nellore", name: "Nellore", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "kurnool", name: "Kurnool", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "rajahmundry", name: "Rajahmundry", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "kakinada", name: "Kakinada", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "anantapur", name: "Anantapur", state: "Andhra Pradesh", country: "India", bookingEnabled: false },
  { id: "warangal", name: "Warangal", state: "Telangana", country: "India", bookingEnabled: false },
  { id: "karimnagar", name: "Karimnagar", state: "Telangana", country: "India", bookingEnabled: false },
  { id: "khammam", name: "Khammam", state: "Telangana", country: "India", bookingEnabled: false },
  { id: "mysuru", name: "Mysuru", state: "Karnataka", country: "India", bookingEnabled: false },
  { id: "mangaluru", name: "Mangaluru", state: "Karnataka", country: "India", bookingEnabled: false },
  { id: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", country: "India", bookingEnabled: false },
  { id: "madurai", name: "Madurai", state: "Tamil Nadu", country: "India", bookingEnabled: false },
  { id: "thiruvananthapuram", name: "Thiruvananthapuram", state: "Kerala", country: "India", bookingEnabled: false },
  { id: "kozhikode", name: "Kozhikode", state: "Kerala", country: "India", bookingEnabled: false },
  { id: "nagpur", name: "Nagpur", state: "Maharashtra", country: "India", bookingEnabled: false },
  { id: "nashik", name: "Nashik", state: "Maharashtra", country: "India", bookingEnabled: false },
  { id: "kanpur", name: "Kanpur", state: "Uttar Pradesh", country: "India", bookingEnabled: false },
  { id: "agra", name: "Agra", state: "Uttar Pradesh", country: "India", bookingEnabled: false },
  { id: "varanasi", name: "Varanasi", state: "Uttar Pradesh", country: "India", bookingEnabled: false },
  { id: "surat", name: "Surat", state: "Gujarat", country: "India", bookingEnabled: false },
  { id: "vadodara", name: "Vadodara", state: "Gujarat", country: "India", bookingEnabled: false },
  { id: "indore", name: "Indore", state: "Madhya Pradesh", country: "India", bookingEnabled: false },
  { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", country: "India", bookingEnabled: false },
  { id: "patna", name: "Patna", state: "Bihar", country: "India", bookingEnabled: false },
  { id: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", country: "India", bookingEnabled: false },
  { id: "cuttack", name: "Cuttack", state: "Odisha", country: "India", bookingEnabled: false },
  { id: "guwahati", name: "Guwahati", state: "Assam", country: "India", bookingEnabled: false },
  { id: "ranchi", name: "Ranchi", state: "Jharkhand", country: "India", bookingEnabled: false },
  { id: "raipur", name: "Raipur", state: "Chhattisgarh", country: "India", bookingEnabled: false },
  { id: "dehradun", name: "Dehradun", state: "Uttarakhand", country: "India", bookingEnabled: false },
  { id: "shimla", name: "Shimla", state: "Himachal Pradesh", country: "India", bookingEnabled: false },
  { id: "goa", name: "Panaji / Goa", state: "Goa", country: "India", bookingEnabled: false },
  { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", country: "India", bookingEnabled: false }
];
