export type AdminRole =
  | 'super_admin'
  | 'content_manager'
  | 'theatre_manager'
  | 'support_agent'
  | 'finance_manager';

export type AdminPermission =
  // Movies & Content
  | 'movies:read'
  | 'movies:write'
  | 'movies:delete'
  | 'movies:publish'
  | 'events:read'
  | 'events:write'
  | 'events:delete'
  | 'homepage:manage'
  | 'media:manage'
  // Cinema
  | 'theatres:read'
  | 'theatres:write'
  | 'theatres:delete'
  | 'screens:manage'
  | 'seat_layouts:manage'
  | 'shows:read'
  | 'shows:write'
  | 'shows:delete'
  | 'locations:manage'
  // Transactions & Finance
  | 'bookings:read'
  | 'bookings:export'
  | 'payments:read'
  | 'refunds:read'
  | 'refunds:manage'
  | 'coupons:manage'
  // Partners
  | 'venue_applications:read'
  | 'venue_applications:manage'
  // Users & Admins
  | 'users:read'
  | 'users:manage'
  | 'admins:read'
  | 'admins:manage'
  | 'roles:manage'
  // Communication
  | 'notifications:manage'
  | 'support:read'
  | 'support:manage'
  | 'feedback:read'
  | 'feedback:manage'
  // System
  | 'audit_logs:read'
  | 'settings:read'
  | 'settings:write'
  | 'database:seed';

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  customPermissions?: AdminPermission[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;

  lastLoginAt?: string;
}

export interface AdminSession {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  expiresAt: number;
}

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  adminName: string;
  action: string;
  entityType:
    | 'movie'
    | 'event'
    | 'theatre'
    | 'screen'
    | 'seat_layout'
    | 'show'
    | 'location'
    | 'homepage'
    | 'media'
    | 'coupon'
    | 'refund'
    | 'venue_application'
    | 'user'
    | 'admin'
    | 'admin_user'
    | 'booking'
    | 'payment'
    | 'ticket'
    | 'notification'
    | 'settings'
    | 'system';

  entityId?: string;
  summary: string;
  details?: Record<string, unknown>;
  previousData?: unknown;
  newData?: unknown;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  id?: string;
  platformName?: string;
  supportEmail: string;
  supportPhone: string;
  bookingFee?: number;
  platformFee?: number;
  taxPercentage: number;
  maxSeatsPerBooking?: number;
  seatHoldMinutes?: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  defaultCity?: string;
  currency?: string;
  publicRegistrationEnabled?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}


export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'flat';
  discountValue?: number;
  discountAmount?: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount?: number;
  usageCount?: number;
  perUserLimit?: number;
  isActive?: boolean;
  status?: 'active' | 'expired' | 'disabled';
  applicableMovies?: string[]; // Empty for all
  applicableTheatres?: string[];
  applicableLocations?: string[];
  createdAt: string;
  updatedAt?: string;
}


export interface RefundRecord {
  id: string;
  bookingId: string;
  paymentId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  reason: string;
  originalAmount?: number;
  requestedAmount?: number;
  refundedAmount?: number;
  razorpayPaymentId?: string;
  razorpayRefundId?: string;
  gatewayRefundId?: string;
  status: 'requested' | 'under_review' | 'approved' | 'processing' | 'refunded' | 'rejected' | 'processed';
  initiatedBy?: string;
  approvedBy?: string;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  processedAt?: string;
}


export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  movieId?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  title: string;
  subtitle?: string;
  type: 'hero' | 'now_showing' | 'featured_movies' | 'trending' | 'upcoming_movies' | 'events_near_you' | 'featured_theatres' | 'promotional_banner' | 'custom';
  enabled: boolean;
  displayOrder: number;
  itemCount?: number;
  customFilter?: string;
}
