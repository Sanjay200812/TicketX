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
        href: '#',
        icon: 'MapPin',
        hasDropdown: true,
        children: [
          { label: 'Guntur', href: 'guntur' },
          { label: 'Vijayawada', href: 'vijayawada' },
          { label: 'Narasaraopeta (NRT)', href: 'nrt' },
          { label: 'Sattenapalli', href: 'sattenapalli' },
          { label: 'Edlapadu', href: 'edlapadu' },
          { label: 'Martur', href: 'martur' },
        ],
      },
      { label: 'Saved Movies', href: '/favorites', icon: 'Heart' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'My Bookings', href: '/my-bookings', icon: 'Ticket' },
      { label: 'Settings', href: '/settings', icon: 'Settings' },
    ],
  },
  {
    title: 'HELP',
    items: [
      { label: 'Support', href: '/support', icon: 'HelpCircle' },
      { label: 'FAQ', href: '/support/faq', icon: 'FileQuestion' },
      { label: 'Feedback', href: '/support/feedback', icon: 'MessageSquare' },
      { label: 'Contact Us', href: '/support/contact', icon: 'Mail' },
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
