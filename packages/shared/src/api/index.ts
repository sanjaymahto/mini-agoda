import { CITIES } from '../data/cities';
import { generateReviews, generateRooms, HOTELS } from '../data/hotels';
import { eventBus } from '../events';
import { storage } from '../storage';
import type {
  Booking,
  City,
  CreateBookingRequest,
  Destination,
  Hotel,
  Review,
  ReviewSummary,
  Room,
  SearchRequest,
  SearchResponse,
  TravelerType,
  User,
} from '../types';
import { nightsBetween, today } from '../utils/dates';
import { calculatePrice, discountPercent, findPromo } from '../utils/pricing';

/**
 * Mock backend. Every function is async and adds artificial latency so the UI
 * exercises real loading states. Swap this module for real `fetch` calls later
 * without touching any MFE - see docs/MOCK_API.md.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const LATENCY_MS = { min: 250, max: 650 };

function delay<T>(value: T, ms?: number): Promise<T> {
  const wait = ms ?? LATENCY_MS.min + Math.random() * (LATENCY_MS.max - LATENCY_MS.min);
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), wait));
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function findHotel(hotelId: string): Hotel {
  const hotel = HOTELS.find((h) => h.id === hotelId);
  if (!hotel) throw new ApiError(`Hotel "${hotelId}" not found`, 404);
  return hotel;
}

/* ----------------------------------------------------------- catalogue */

export async function getCities(): Promise<City[]> {
  return delay(CITIES, 150);
}

export async function searchDestinations(query: string): Promise<Destination[]> {
  const q = normalize(query);
  if (!q) return delay(CITIES.slice(0, 6).map(cityToDestination), 80);

  const cities = CITIES.filter((c) => normalize(c.name).includes(q) || normalize(c.country).includes(q)).map(cityToDestination);
  const hotels = HOTELS.filter((h) => normalize(h.name).includes(q))
    .slice(0, 5)
    .map<Destination>((h) => ({ type: 'hotel', id: h.id, label: h.name, sublabel: `${h.city}, ${h.country}` }));
  return delay([...cities, ...hotels], 120);
}

function cityToDestination(city: City): Destination {
  return { type: 'city', id: city.id, label: city.name, sublabel: `${city.country} · ${city.propertyCount} properties` };
}

export async function getDeals(limit = 8): Promise<Hotel[]> {
  const deals = HOTELS.filter((h) => h.originalPrice)
    .sort((a, b) => discountPercent(b.pricePerNight, b.originalPrice) - discountPercent(a.pricePerNight, a.originalPrice))
    .slice(0, limit);
  return delay(deals);
}

export async function searchHotels(request: SearchRequest): Promise<SearchResponse> {
  const q = normalize(request.destination ?? '');
  const inDestination = q
    ? HOTELS.filter((h) => [h.city, h.country, h.name, h.cityId].some((field) => normalize(field).includes(q)))
    : HOTELS;

  const prices = inDestination.map((h) => h.pricePerNight);
  const priceRange = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 };

  const results = inDestination.filter((h) => {
    if (request.minPrice !== undefined && h.pricePerNight < request.minPrice) return false;
    if (request.maxPrice !== undefined && h.pricePerNight > request.maxPrice) return false;
    if (request.stars?.length && !request.stars.includes(h.stars)) return false;
    if (request.minScore !== undefined && h.reviewScore < request.minScore) return false;
    if (request.propertyTypes?.length && !request.propertyTypes.includes(h.propertyType)) return false;
    if (request.amenities?.length && !request.amenities.every((a) => h.amenities.includes(a))) return false;
    if (request.freeCancellation && !h.freeCancellation) return false;
    return true;
  });

  const sorters: Record<NonNullable<SearchRequest['sort']>, (a: Hotel, b: Hotel) => number> = {
    // "Recommended" blends review score, popularity and deals - a stand-in for a ranking model.
    recommended: (a, b) => score(b) - score(a),
    price_asc: (a, b) => a.pricePerNight - b.pricePerNight,
    price_desc: (a, b) => b.pricePerNight - a.pricePerNight,
    rating: (a, b) => b.reviewScore - a.reviewScore,
    stars: (a, b) => b.stars - a.stars || b.reviewScore - a.reviewScore,
    distance: (a, b) => a.distanceToCenterKm - b.distanceToCenterKm,
  };
  results.sort(sorters[request.sort ?? 'recommended'] ?? sorters.recommended);

  const pageSize = request.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(Math.max(1, request.page ?? 1), totalPages);

  return delay({
    hotels: results.slice((page - 1) * pageSize, page * pageSize),
    total: results.length,
    page,
    pageSize,
    totalPages,
    priceRange,
  });
}

function score(h: Hotel) {
  return h.reviewScore * 10 + Math.log10(h.reviewCount) * 5 + discountPercent(h.pricePerNight, h.originalPrice) * 0.3;
}

export async function getHotel(hotelId: string): Promise<Hotel> {
  return delay(findHotel(hotelId));
}

export async function getHotelsByIds(hotelIds: string[]): Promise<Hotel[]> {
  return delay(hotelIds.map((id) => HOTELS.find((h) => h.id === id)).filter((h): h is Hotel => Boolean(h)));
}

export async function getSimilarHotels(hotelId: string, limit = 4): Promise<Hotel[]> {
  const hotel = findHotel(hotelId);
  const similar = HOTELS.filter((h) => h.cityId === hotel.cityId && h.id !== hotel.id)
    .sort((a, b) => Math.abs(a.pricePerNight - hotel.pricePerNight) - Math.abs(b.pricePerNight - hotel.pricePerNight))
    .slice(0, limit);
  return delay(similar);
}

export async function getRooms(hotelId: string): Promise<Room[]> {
  return delay(generateRooms(findHotel(hotelId)));
}

export async function getRoom(hotelId: string, roomId: string): Promise<{ hotel: Hotel; room: Room }> {
  const hotel = findHotel(hotelId);
  const room = generateRooms(hotel).find((r) => r.id === roomId);
  if (!room) throw new ApiError(`Room "${roomId}" not found`, 404);
  return delay({ hotel, room });
}

export interface ReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
  total: number;
  page: number;
  totalPages: number;
}

export async function getReviews(
  hotelId: string,
  options: { page?: number; pageSize?: number; travelerType?: TravelerType } = {},
): Promise<ReviewsResponse> {
  const hotel = findHotel(hotelId);
  const all = generateReviews(hotel);
  const filtered = options.travelerType ? all.filter((r) => r.travelerType === options.travelerType) : all;
  const pageSize = options.pageSize ?? 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(1, options.page ?? 1), totalPages);

  const base = hotel.reviewScore;
  const clamp = (v: number) => Math.min(10, Math.max(1, Number(v.toFixed(1))));
  const summary: ReviewSummary = {
    average: base,
    count: hotel.reviewCount,
    categories: [
      { label: 'Cleanliness', score: clamp(base + 0.3) },
      { label: 'Location', score: clamp(base + 0.5) },
      { label: 'Service', score: clamp(base + 0.1) },
      { label: 'Facilities', score: clamp(base - 0.3) },
      { label: 'Value for money', score: clamp(base - 0.1) },
    ],
  };

  return delay({ reviews: filtered.slice((page - 1) * pageSize, page * pageSize), summary, total: filtered.length, page, totalPages });
}

/* ---------------------------------------------------------------- auth */

interface StoredUser extends User {
  password: string;
}

const DEMO_USER: StoredUser = {
  id: 'u-demo',
  firstName: 'Demo',
  lastName: 'Traveller',
  email: 'demo@miniagoda.com',
  password: 'password123',
  phone: '+65 9123 4567',
  country: 'Singapore',
  memberSince: '2024-03-12',
};

const usersDb = {
  all: () => {
    const users = storage.get<StoredUser[]>('db:users', []);
    return users.some((u) => u.id === DEMO_USER.id) ? users : [DEMO_USER, ...users];
  },
  save: (users: StoredUser[]) => storage.set('db:users', users),
};

const publicUser = ({ password: _password, ...user }: StoredUser): User => user;

export async function login(email: string, password: string): Promise<User> {
  const user = usersDb.all().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  await delay(null, 400);
  if (!user || user.password !== password) throw new ApiError('Incorrect email or password', 401);
  return publicUser(user);
}

export async function signup(input: { firstName: string; lastName: string; email: string; password: string }): Promise<User> {
  const users = usersDb.all();
  await delay(null, 500);
  if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new ApiError('An account with this email already exists', 409);
  }
  const user: StoredUser = { ...input, email: input.email.trim(), id: `u-${Date.now().toString(36)}`, memberSince: today() };
  usersDb.save([...users, user]);
  return publicUser(user);
}

export async function updateProfile(userId: string, patch: Partial<Omit<User, 'id' | 'email' | 'memberSince'>>): Promise<User> {
  const users = usersDb.all();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new ApiError('User not found', 404);
  users[index] = { ...users[index], ...patch };
  usersDb.save(users);
  return delay(publicUser(users[index]));
}

/* ------------------------------------------------------------ bookings */

const bookingsDb = {
  all: () => storage.get<Booking[]>('db:bookings', []),
  save: (bookings: Booking[]) => storage.set('db:bookings', bookings),
};

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  const hotel = findHotel(request.hotelId);
  const room = generateRooms(hotel).find((r) => r.id === request.roomId);
  if (!room) throw new ApiError('Selected room is no longer available', 409);

  const nights = nightsBetween(request.checkIn, request.checkOut);
  if (nights < 1) throw new ApiError('Check-out must be after check-in', 400);
  if (request.paymentMethod === 'pay_at_hotel' && !room.payAtHotel) {
    throw new ApiError('Pay at hotel is not available for this room', 400);
  }

  const booking: Booking = {
    id: `MA${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`,
    userId: request.userId,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelImage: hotel.images[0],
    city: hotel.city,
    roomId: room.id,
    roomName: room.name,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    adults: request.adults,
    children: request.children,
    rooms: request.rooms,
    guest: request.guest,
    paymentMethod: request.paymentMethod,
    cardLast4: request.cardLast4,
    promoCode: findPromo(request.promoCode)?.code,
    price: calculatePrice(room.pricePerNight, nights, request.rooms, request.promoCode),
    freeCancellation: room.freeCancellation,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  await delay(null, 900);
  bookingsDb.save([booking, ...bookingsDb.all()]);
  eventBus.emit('booking:created', { booking });
  return booking;
}

export async function getBooking(bookingId: string): Promise<Booking> {
  const booking = bookingsDb.all().find((b) => b.id === bookingId);
  if (!booking) throw new ApiError('Booking not found', 404);
  return delay(booking);
}

export async function getBookings(userId: string): Promise<Booking[]> {
  return delay(bookingsDb.all().filter((b) => b.userId === userId));
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  const bookings = bookingsDb.all();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new ApiError('Booking not found', 404);
  if (!booking.freeCancellation) throw new ApiError('This booking is non-refundable and cannot be cancelled', 400);
  if (booking.checkIn <= today()) throw new ApiError('Bookings can only be cancelled before check-in', 400);

  booking.status = 'cancelled';
  bookingsDb.save(bookings);
  await delay(null, 500);
  eventBus.emit('booking:cancelled', { bookingId });
  return booking;
}
