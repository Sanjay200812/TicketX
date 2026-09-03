import { AdminRole, AdminPermission } from '@/types/admin';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'movies:read',
    'movies:write',
    'movies:delete',
    'movies:publish',
    'events:read',
    'events:write',
    'events:delete',
    'homepage:manage',
    'media:manage',
    'theatres:read',
    'theatres:write',
    'theatres:delete',
    'screens:manage',
    'seat_layouts:manage',
    'shows:read',
    'shows:write',
    'shows:delete',
    'locations:manage',
    'bookings:read',
    'bookings:export',
    'payments:read',
    'refunds:read',
    'refunds:manage',
    'coupons:manage',
    'venue_applications:read',
    'venue_applications:manage',
    'users:read',
    'users:manage',
    'admins:read',
    'admins:manage',
    'roles:manage',
    'notifications:manage',
    'support:read',
    'support:manage',
    'feedback:read',
    'feedback:manage',
    'audit_logs:read',
    'settings:read',
    'settings:write',
    'database:seed',
  ],

  content_manager: [
    'movies:read',
    'movies:write',
    'movies:publish',
    'events:read',
    'events:write',
    'homepage:manage',
    'media:manage',
  ],

  theatre_manager: [
    'theatres:read',
    'theatres:write',
    'screens:manage',
    'seat_layouts:manage',
    'shows:read',
    'shows:write',
    'shows:delete',
    'locations:manage',
  ],

  support_agent: [
    'users:read',
    'bookings:read',
    'support:read',
    'support:manage',
    'feedback:read',
    'feedback:manage',
    'notifications:manage',
  ],

  finance_manager: [
    'bookings:read',
    'bookings:export',
    'payments:read',
    'refunds:read',
    'refunds:manage',
    'coupons:manage',
  ],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  content_manager: 'Content Manager',
  theatre_manager: 'Theatre Manager',
  support_agent: 'Support Agent',
  finance_manager: 'Finance Manager',
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full unrestricted administrative privileges across all TicketX systems.',
  content_manager: 'Manage movies, events, media uploads, and homepage curation.',
  theatre_manager: 'Manage theatres, screens, shows, bulk scheduling, and seat layouts.',
  support_agent: 'Handle customer support tickets, user feedback, and basic booking lookups.',
  finance_manager: 'Handle payments, refund requests, revenue accounting, and coupons.',
};

export function hasPermission(
  role: AdminRole,
  permission: AdminPermission,
  customPermissions?: AdminPermission[]
): boolean {
  if (role === 'super_admin') return true;
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  if (rolePerms.includes(permission)) return true;
  if (customPermissions && customPermissions.includes(permission)) return true;
  return false;
}
