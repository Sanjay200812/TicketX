export interface TicketXTheatre {
  id: string;
  slug?: string;
  name: string;
  locationId: string;
  area?: string;
  address?: string;
  status?: 'available' | 'coming-soon';
  screenIds?: string[];
  facilities?: string[];
  format?: string[];
}

export type Theatre = TicketXTheatre;
