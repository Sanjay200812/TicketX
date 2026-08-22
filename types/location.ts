export interface TicketXLocation {
  id: string;
  name: string;
  state: string;
  country: string;
  shortName?: string;
  bookingEnabled: boolean;
  isPopular?: boolean;
  isEventOnly?: boolean;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  lat: number;
  lng: number;
  isPopular?: boolean;
  bookingEnabled?: boolean;
  isEventOnly?: boolean;
}

export interface UserLocation {
  city: City;
  location: TicketXLocation;
  coords?: { lat: number; lng: number };
  isGeolocation: boolean;
}
