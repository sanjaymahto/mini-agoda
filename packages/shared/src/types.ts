/**
 * Domain model shared by every micro frontend.
 * Changing these types is a cross-team contract change - see docs/DATA_MODEL.md.
 */

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'THB' | 'SGD' | 'JPY';

export type PropertyType = 'Hotel' | 'Resort' | 'Apartment' | 'Hostel' | 'Villa';

export type Amenity =
  | 'Free WiFi'
  | 'Swimming pool'
  | 'Free breakfast'
  | 'Parking'
  | 'Fitness center'
  | 'Spa'
  | 'Airport transfer'
  | 'Restaurant'
  | 'Bar'
  | 'Air conditioning'
  | 'Pet friendly'
  | '24h front desk';

export interface City {
  id: string;
  name: string;
  country: string;
  image: string;
  tagline: string;
  /** Approximate number of properties shown on the home page. */
  propertyCount: number;
}

export interface Landmark {
  name: string;
  distanceKm: number;
}

export interface Hotel {
  id: string;
  name: string;
  cityId: string;
  city: string;
  country: string;
  address: string;
  propertyType: PropertyType;
  /** Official star rating, 1-5. */
  stars: number;
  /** Average guest review score, 0-10. */
  reviewScore: number;
  reviewCount: number;
  /** Lowest nightly price in USD (base currency). */
  pricePerNight: number;
  /** Price before discount in USD, when a deal is running. */
  originalPrice?: number;
  distanceToCenterKm: number;
  images: string[];
  description: string;
  highlights: string[];
  amenities: Amenity[];
  freeCancellation: boolean;
  payAtHotel: boolean;
  landmarks: Landmark[];
  checkInTime: string;
  checkOutTime: string;
  coordinates: { lat: number; lng: number };
}

export type BedType = 'King' | 'Queen' | 'Twin' | 'Double' | 'Bunk';

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  bedType: BedType;
  sizeSqm: number;
  maxGuests: number;
  /** Nightly price in USD. */
  pricePerNight: number;
  originalPrice?: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  payAtHotel: boolean;
  roomsLeft: number;
  amenities: string[];
  image: string;
}

export type TravelerType = 'Solo' | 'Couple' | 'Family' | 'Business' | 'Group';

export interface Review {
  id: string;
  hotelId: string;
  author: string;
  country: string;
  travelerType: TravelerType;
  score: number;
  title: string;
  comment: string;
  date: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  categories: { label: string; score: number }[];
}

export type SortOption = 'recommended' | 'price_asc' | 'price_desc' | 'rating' | 'stars' | 'distance';

export interface SearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  minScore?: number;
  propertyTypes?: PropertyType[];
  amenities?: Amenity[];
  freeCancellation?: boolean;
}

export interface SearchRequest extends Partial<SearchCriteria>, SearchFilters {
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  hotels: Hotel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Min/max nightly price of all hotels in the destination - used to bound the price filter. */
  priceRange: { min: number; max: number };
}

export interface Destination {
  type: 'city' | 'hotel';
  id: string;
  label: string;
  sublabel: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  memberSince: string;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  arrivalTime?: string;
  specialRequests?: string;
}

export type PaymentMethod = 'card' | 'pay_at_hotel';

export interface PriceBreakdown {
  nights: number;
  rooms: number;
  roomTotal: number;
  discount: number;
  taxesAndFees: number;
  total: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  userId?: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  city: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  guest: GuestDetails;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  promoCode?: string;
  price: PriceBreakdown;
  freeCancellation: boolean;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingRequest {
  userId?: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  guest: GuestDetails;
  paymentMethod: PaymentMethod;
  cardLast4?: string;
  promoCode?: string;
}
