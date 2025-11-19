export type AppRole = 'buyer' | 'seller' | 'admin';

export type PropertyType = 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';

export type ListingStatus = 'active' | 'pending' | 'sold' | 'inactive';

export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

export type NotificationType = 'message' | 'report' | 'listing' | 'system';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size?: number;
  year_built?: number;
  images: string[];
  status: ListingStatus;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  disposition?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}
