// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Authentication
export const JWT_COOKIE_NAME = process.env.NEXT_PUBLIC_JWT_COOKIE_NAME || 'crown_bidder_token';
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiration

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AUCTIONEER: 'auctioneer',
  BIDDER: 'bidder',
};

// Auction Status
export const AUCTION_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDED: 'ended',
  PAUSED: 'paused',
};

// Bid Types
export const BID_TYPES = {
  ONLINE: 'online',
  PHONE: 'phone',
  FLOOR: 'floor',
};

// Site Categories
export const SITE_CATEGORIES = [
  { value: 'art-antiques', label: 'Art & Antiques' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'charity', label: 'Charity' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'general', label: 'General' },
];

// Default Themes
export const DEFAULT_THEMES = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    primaryColor: '#1e40af',
    secondaryColor: '#64748b',
    preview: '/themes/classic-blue.png',
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    primaryColor: '#7c3aed',
    secondaryColor: '#6b7280',
    preview: '/themes/elegant-purple.png',
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    primaryColor: '#059669',
    secondaryColor: '#6b7280',
    preview: '/themes/modern-green.png',
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    primaryColor: '#d97706',
    secondaryColor: '#78716c',
    preview: '/themes/luxury-gold.png',
  },
  {
    id: 'professional-gray',
    name: 'Professional Gray',
    primaryColor: '#475569',
    secondaryColor: '#94a3b8',
    preview: '/themes/professional-gray.png',
  },
  {
    id: 'vibrant-red',
    name: 'Vibrant Red',
    primaryColor: '#dc2626',
    secondaryColor: '#6b7280',
    preview: '/themes/vibrant-red.png',
  },
];

// Domain Verification Status
export const DOMAIN_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  ERROR: 'error',
  TIMEOUT: 'timeout',
  ROLLBACK: 'rollback',
};

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 2097152; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Socket.IO Events
export const SOCKET_EVENTS = {
  // Connection
  JOIN_SITE: 'join:site',
  JOIN_AUCTION: 'join:auction',
  JOINED_SITE: 'joined:site',
  JOINED_AUCTION: 'joined:auction',

  // Auction Management
  AUCTION_START: 'auction:start',
  AUCTION_END: 'auction:end',
  AUCTION_NEXT_ITEM: 'auction:next-item',
  AUCTION_PAUSE: 'auction:pause',
  AUCTION_STARTED: 'auction:started',
  AUCTION_ENDED: 'auction:ended',
  AUCTION_ITEM_CHANGED: 'auction:item-changed',
  AUCTION_STATUS_CHANGED: 'auction:status-changed',

  // Bidding
  BID_PLACE: 'bid:place',
  BID_QUICK: 'bid:quick',
  BID_PLACED: 'bid:placed',
  BID_CONFIRMED: 'bid:confirmed',
  BID_ERROR: 'bid:error',
  BID_OUTBID: 'bid:outbid',

  // Admin
  ADMIN_SITE_STATS: 'admin:site-stats',
  ADMIN_CONNECTED_USERS: 'admin:connected-users',
  ADMIN_BROADCAST: 'admin:broadcast',
};

// Error Codes
export const ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  SITE_ACCESS_DENIED: 'SITE_ACCESS_DENIED',
  AUCTION_NOT_FOUND: 'AUCTION_NOT_FOUND',
  BID_TOO_LOW: 'BID_TOO_LOW',
  RATE_LIMITED: 'RATE_LIMITED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};
