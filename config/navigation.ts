export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  hasDropdown?: boolean;
  roleRequired?: 'customer' | 'venue_owner' | 'admin';
  children?: { label: string; href: string }[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const TOP_NAV_ITEMS: NavItem[] = [
  { label: 'HOME', href: '/', hasDropdown: false },
  { label: 'MOVIES', href: '/movies', hasDropdown: false },
  { label: 'EVENTS', href: '/events', hasDropdown: false },
  {
    label: 'THEATRES',
    href: '/theatres',
    hasDropdown: true,
    children: [
      { label: 'All Theatres', href: '/theatres' },
      { label: 'Guntur', href: '/theatres?location=guntur' },
      { label: 'Vijayawada', href: '/theatres?location=vijayawada' },
      { label: 'Narasaraopeta', href: '/theatres?location=nrt' },
      { label: 'Sattenapalli', href: '/theatres?location=sattenapalli' },
      { label: 'Edlapadu', href: '/theatres?location=edlapadu' },
      { label: 'Martur', href: '/theatres?location=martur' },
    ],
  },
  {
    label: 'LOCATIONS',
    href: '#locations',
    hasDropdown: true,
    children: [
      { label: 'Current Location', href: '#current-location' },
      { label: 'Saved Locations', href: '#saved-locations' },
      { label: 'Use My Location', href: '#use-my-location' },
      { label: 'Search Location', href: '#search-location' },
    ],
  },
];

export const SIDEBAR_NAV_SECTIONS: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Home', href: '/', icon: 'Home' },
      { label: 'Movies', href: '/movies', icon: 'Film' },
      { label: 'Events', href: '/events', icon: 'Sparkles' },
    ],
  },
  {
    title: 'DISCOVER',
    items: [
      {
        label: 'Theatres',
        href: '/theatres',
        icon: 'Building2',
        hasDropdown: true,
        children: [
          { label: 'All Theatres', href: '/theatres' },
          { label: 'Guntur', href: '/theatres?location=guntur' },
          { label: 'Vijayawada', href: '/theatres?location=vijayawada' },
          { label: 'Narasaraopeta', href: '/theatres?location=nrt' },
          { label: 'Sattenapalli', href: '/theatres?location=sattenapalli' },
          { label: 'Edlapadu', href: '/theatres?location=edlapadu' },
          { label: 'Martur', href: '/theatres?location=martur' },
        ],
      },
      {
        label: 'Locations',
        href: '#locations',
        icon: 'MapPin',
        hasDropdown: true,
        children: [
          { label: 'Current Location', href: '#current-location' },
          { label: 'Saved Locations', href: '#saved-locations' },
          { label: 'Use My Location', href: '#use-my-location' },
        ],
      },
      { label: 'Saved Movies', href: '/favorites', icon: 'Heart' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'My Bookings', href: '/my-bookings', icon: 'Ticket' },
      { label: 'Profile', href: '/profile', icon: 'User' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
  {
    title: 'HELP',
    items: [
      { label: 'Support', href: '/support', icon: 'HelpCircle' },
      { label: 'FAQ', href: '/support/faq', icon: 'FileQuestion' },
      { label: 'Feedback', href: '/support/feedback', icon: 'MessageSquare' },
    ],
  },
  {
    title: 'PARTNER',
    items: [
      { label: 'Register Your Hall', href: '/register', icon: 'Store', roleRequired: 'venue_owner' },
      { label: 'My Venue Registrations', href: '/profile', icon: 'Building', roleRequired: 'venue_owner' },
    ],
  },
];
