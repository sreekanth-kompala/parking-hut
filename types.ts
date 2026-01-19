
export type UserRole = 'provider' | 'seeker';
export type VehicleType = 'car' | 'bike' | 'suv';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
// Shared tab identification type for application navigation
export type TabID = 'home' | 'spaces' | 'bookings' | 'profile';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role?: UserRole;
  phone: string;
  telephone?: string;
  createdAt: number;
}

export interface Pricing {
  hourly: number;
  daily: number;
  monthly: number;
}

export interface SpacePricing {
  car: Pricing;
  bike: Pricing;
  suv: Pricing;
}

export interface ParkingSpace {
  id: string;
  providerId: string;
  title: string;
  description: string;
  address: string;
  landmark?: string;
  amenities: string[];
  pricing: SpacePricing;
  isAvailable: boolean;
  totalSlots: number;
  carSlots: number;
  bikeSlots: number;
  location?: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
}

export interface Booking {
  id: string;
  spaceId: string;
  seekerId: string;
  providerId: string;
  vehicleType: VehicleType;
  startTime: number;
  endTime: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: number;
  spaceTitle?: string;
  spaceAddress?: string;
  seekerName?: string;
  seekerPhone?: string;
}
