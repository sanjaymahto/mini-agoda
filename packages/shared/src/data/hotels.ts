import type { Amenity, BedType, Hotel, PropertyType, Review, Room, TravelerType } from '../types';
import { CITIES } from './cities';
import { HOTEL_EXTERIOR_IMAGES, ROOM_IMAGES } from './images';
import { createRandom, hashString } from './random';

type HotelSeed = [name: string, type: PropertyType, stars: number, basePrice: number, area: string];

/** Hand-written hotel names per city; everything else is generated deterministically. */
const HOTEL_SEEDS: Record<string, HotelSeed[]> = {
  bangkok: [
    ['Riverside Orchid Hotel', 'Hotel', 5, 185, 'Charoen Krung Rd'],
    ['Sukhumvit Grand Suites', 'Hotel', 4, 96, 'Sukhumvit Soi 11'],
    ['Silom Urban Hostel', 'Hostel', 2, 18, 'Silom Rd'],
    ['Chao Phraya Palace', 'Resort', 5, 240, 'Khlong San'],
    ['Siam Skyline Residences', 'Apartment', 4, 72, 'Rama I Rd'],
    ['Lumpini Garden Villa', 'Villa', 4, 130, 'Wireless Rd'],
    ['Khao San Backpackers', 'Hostel', 1, 12, 'Khao San Rd'],
  ],
  singapore: [
    ['Marina Bay Vista', 'Hotel', 5, 360, 'Bayfront Ave'],
    ['Orchard Boutique Inn', 'Hotel', 4, 175, 'Orchard Rd'],
    ['Chinatown Heritage Lodge', 'Hotel', 3, 98, 'Pagoda St'],
    ['Sentosa Beach Resort', 'Resort', 5, 310, 'Siloso Beach Walk'],
    ['Clarke Quay Serviced Apartments', 'Apartment', 4, 150, 'River Valley Rd'],
    ['Bugis Pod Capsule', 'Hostel', 2, 38, 'Beach Rd'],
  ],
  tokyo: [
    ['Shinjuku Sky Tower Hotel', 'Hotel', 5, 290, 'Nishi-Shinjuku'],
    ['Asakusa Ryokan Sakura', 'Hotel', 4, 160, 'Asakusa 2-chome'],
    ['Shibuya Crossing Inn', 'Hotel', 3, 110, 'Dogenzaka'],
    ['Ginza Luxe Residences', 'Apartment', 5, 330, 'Ginza 6-chome'],
    ['Ueno Park Capsule', 'Hostel', 2, 32, 'Ueno 7-chome'],
    ['Roppongi Hills Suites', 'Hotel', 4, 210, 'Roppongi 6-chome'],
  ],
  bali: [
    ['Ubud Jungle Retreat', 'Resort', 5, 210, 'Jl. Raya Ubud'],
    ['Seminyak Beach Villas', 'Villa', 5, 280, 'Jl. Kayu Aya'],
    ['Canggu Surf House', 'Hostel', 2, 22, 'Jl. Batu Bolong'],
    ['Nusa Dua Lagoon Resort', 'Resort', 5, 250, 'Kawasan BTDC'],
    ['Kuta Sunset Hotel', 'Hotel', 3, 55, 'Jl. Pantai Kuta'],
    ['Uluwatu Cliff Villa', 'Villa', 4, 190, 'Jl. Labuansait'],
  ],
  dubai: [
    ['Burj View Grand Hotel', 'Hotel', 5, 380, 'Downtown Dubai'],
    ['Palm Jumeirah Resort & Spa', 'Resort', 5, 450, 'Palm Jumeirah'],
    ['Dubai Marina Apartments', 'Apartment', 4, 160, 'Dubai Marina'],
    ['Deira Creek Hotel', 'Hotel', 3, 75, 'Al Rigga'],
    ['Al Barsha Business Hotel', 'Hotel', 4, 120, 'Al Barsha 1'],
  ],
  paris: [
    ['Le Petit Montmartre', 'Hotel', 3, 140, 'Rue Lepic'],
    ['Hôtel Rive Gauche', 'Hotel', 4, 230, 'Saint-Germain-des-Prés'],
    ['Champs-Élysées Palace', 'Hotel', 5, 520, 'Avenue George V'],
    ['Marais Loft Apartments', 'Apartment', 4, 190, 'Le Marais'],
    ['Bastille Budget Hostel', 'Hostel', 2, 35, 'Rue de la Roquette'],
    ['Eiffel Garden Suites', 'Hotel', 4, 260, 'Avenue de Suffren'],
  ],
  mumbai: [
    ['Gateway Heritage Hotel', 'Hotel', 5, 260, 'Colaba'],
    ['Bandra Bay Suites', 'Hotel', 4, 110, 'Bandra West'],
    ['Juhu Beach Resort', 'Resort', 4, 140, 'Juhu Tara Rd'],
    ['Andheri Airport Inn', 'Hotel', 3, 55, 'Andheri East'],
    ['Lower Parel Serviced Apartments', 'Apartment', 4, 95, 'Lower Parel'],
    ['Colaba Backpackers Hub', 'Hostel', 2, 15, 'Colaba Causeway'],
  ],
  phuket: [
    ['Patong Beachfront Hotel', 'Hotel', 4, 90, 'Thawewong Rd'],
    ['Kata Hillside Villas', 'Villa', 5, 260, 'Kata Beach'],
    ['Old Town Sino Hostel', 'Hostel', 2, 14, 'Thalang Rd'],
    ['Kamala Bay Resort', 'Resort', 5, 220, 'Kamala Beach'],
    ['Karon Sands Apartments', 'Apartment', 3, 60, 'Karon Beach'],
  ],
};

const ALL_AMENITIES: Amenity[] = [
  'Free WiFi',
  'Swimming pool',
  'Free breakfast',
  'Parking',
  'Fitness center',
  'Spa',
  'Airport transfer',
  'Restaurant',
  'Bar',
  'Air conditioning',
  'Pet friendly',
  '24h front desk',
];

const LANDMARKS: Record<string, string[]> = {
  bangkok: ['Grand Palace', 'Wat Arun', 'Chatuchak Market', 'Siam Paragon', 'Lumpini Park'],
  singapore: ['Gardens by the Bay', 'Merlion Park', 'Marina Bay Sands', 'Orchard Road', 'Sentosa Island'],
  tokyo: ['Senso-ji Temple', 'Shibuya Crossing', 'Tokyo Tower', 'Meiji Shrine', 'Tsukiji Outer Market'],
  bali: ['Tanah Lot Temple', 'Sacred Monkey Forest', 'Tegallalang Rice Terrace', 'Kuta Beach', 'Uluwatu Temple'],
  dubai: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Creek', 'Mall of the Emirates'],
  paris: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Sacré-Cœur', 'Arc de Triomphe'],
  mumbai: ['Gateway of India', 'Marine Drive', 'Chhatrapati Shivaji Terminus', 'Juhu Beach', 'Bandra-Worli Sea Link'],
  phuket: ['Patong Beach', 'Big Buddha', 'Phuket Old Town', 'Promthep Cape', 'Kata Beach'],
};

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bangkok: { lat: 13.7563, lng: 100.5018 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  bali: { lat: -8.4095, lng: 115.1889 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  paris: { lat: 48.8566, lng: 2.3522 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  phuket: { lat: 7.8804, lng: 98.3923 },
};

const HIGHLIGHTS = [
  'Great location - guests love it',
  'Exceptional breakfast',
  'Rooftop infinity pool',
  'Sparkling clean rooms',
  'Friendly multilingual staff',
  'Walking distance to public transport',
  'Stunning city views',
  'Great value for money',
  'Quiet and peaceful neighbourhood',
  'Award-winning restaurant on site',
];

function describe(name: string, type: PropertyType, city: string, area: string, stars: number) {
  const tone =
    stars >= 5 ? 'an indulgent luxury escape' : stars >= 4 ? 'a stylish and comfortable stay' : stars >= 3 ? 'a relaxed, good-value base' : 'a social, budget-friendly base';
  return `${name} is a ${stars}-star ${type.toLowerCase()} on ${area} offering ${tone} in the heart of ${city}. Rooms are thoughtfully designed with modern furnishings, blackout curtains and high-speed WiFi. Whether you are travelling for business or leisure, our team is on hand around the clock to help you plan the perfect trip, from airport pickups to dinner reservations.`;
}

function buildHotels(): Hotel[] {
  const hotels: Hotel[] = [];
  let index = 0;

  for (const city of CITIES) {
    for (const [name, propertyType, stars, basePrice, area] of HOTEL_SEEDS[city.id] ?? []) {
      index += 1;
      const id = `h${String(index).padStart(3, '0')}`;
      const rnd = createRandom(hashString(id));
      const hasDeal = rnd.chance(0.45);
      const amenityCount = Math.min(ALL_AMENITIES.length, 3 + stars + rnd.int(0, 2));
      const amenities = rnd.sample(ALL_AMENITIES, amenityCount);
      if (!amenities.includes('Free WiFi')) amenities.unshift('Free WiFi');

      const exteriorStart = rnd.int(0, HOTEL_EXTERIOR_IMAGES.length - 1);
      const images = [
        ...Array.from({ length: 3 }, (_, i) => HOTEL_EXTERIOR_IMAGES[(exteriorStart + i) % HOTEL_EXTERIOR_IMAGES.length]),
        ...rnd.sample(ROOM_IMAGES, 3),
      ];

      const center = CITY_COORDS[city.id];
      hotels.push({
        id,
        name,
        cityId: city.id,
        city: city.name,
        country: city.country,
        address: `${rnd.int(1, 299)} ${area}, ${city.name}, ${city.country}`,
        propertyType,
        stars,
        reviewScore: Math.min(9.8, rnd.float(6.4 + stars * 0.4, 7.4 + stars * 0.45)),
        reviewCount: rnd.int(40, 4200),
        pricePerNight: basePrice,
        originalPrice: hasDeal ? Math.round(basePrice * rnd.float(1.15, 1.5, 2)) : undefined,
        distanceToCenterKm: rnd.float(0.2, 12),
        images,
        description: describe(name, propertyType, city.name, area, stars),
        highlights: rnd.sample(HIGHLIGHTS, 3),
        amenities,
        freeCancellation: rnd.chance(0.6),
        payAtHotel: rnd.chance(0.5),
        landmarks: rnd
          .sample(LANDMARKS[city.id], 3)
          .map((landmark) => ({ name: landmark, distanceKm: rnd.float(0.3, 8) }))
          .sort((a, b) => a.distanceKm - b.distanceKm),
        checkInTime: rnd.pick(['14:00', '15:00']),
        checkOutTime: rnd.pick(['11:00', '12:00']),
        coordinates: { lat: center.lat + rnd.float(-0.05, 0.05, 4), lng: center.lng + rnd.float(-0.05, 0.05, 4) },
      });
    }
  }
  return hotels;
}

export const HOTELS: Hotel[] = buildHotels();

for (const city of CITIES) {
  city.propertyCount = HOTELS.filter((hotel) => hotel.cityId === city.id).length;
}

type RoomTemplate = { name: string; bed: BedType; size: number; guests: number; multiplier: number };

const ROOM_TEMPLATES: RoomTemplate[] = [
  { name: 'Standard Double Room', bed: 'Double', size: 22, guests: 2, multiplier: 1 },
  { name: 'Superior Twin Room', bed: 'Twin', size: 26, guests: 2, multiplier: 1.15 },
  { name: 'Deluxe King Room', bed: 'King', size: 32, guests: 2, multiplier: 1.4 },
  { name: 'Family Room', bed: 'Queen', size: 40, guests: 4, multiplier: 1.8 },
  { name: 'Executive Suite', bed: 'King', size: 55, guests: 3, multiplier: 2.6 },
];

const HOSTEL_TEMPLATES: RoomTemplate[] = [
  { name: 'Bed in 8-Bed Mixed Dorm', bed: 'Bunk', size: 30, guests: 1, multiplier: 1 },
  { name: 'Bed in 4-Bed Female Dorm', bed: 'Bunk', size: 18, guests: 1, multiplier: 1.3 },
  { name: 'Private Double Room', bed: 'Double', size: 14, guests: 2, multiplier: 2.4 },
];

const ROOM_AMENITIES = ['City view', 'Rain shower', 'Minibar', 'Smart TV', 'Work desk', 'Bathtub', 'Coffee machine', 'Balcony', 'Safe box', 'Hairdryer'];

export function generateRooms(hotel: Hotel): Room[] {
  const rnd = createRandom(hashString(`${hotel.id}-rooms`));
  const templates = hotel.propertyType === 'Hostel' ? HOSTEL_TEMPLATES : ROOM_TEMPLATES.slice(0, 3 + rnd.int(0, 2));
  const discountRatio = hotel.originalPrice ? hotel.originalPrice / hotel.pricePerNight : undefined;

  return templates.map((template, i) => {
    const price = Math.round(hotel.pricePerNight * template.multiplier);
    return {
      id: `${hotel.id}-r${i + 1}`,
      hotelId: hotel.id,
      name: template.name,
      bedType: template.bed,
      sizeSqm: template.size + rnd.int(0, 6),
      maxGuests: template.guests,
      pricePerNight: price,
      originalPrice: discountRatio ? Math.round(price * discountRatio) : undefined,
      breakfastIncluded: hotel.amenities.includes('Free breakfast') || rnd.chance(0.3),
      // The cheapest room is always non-refundable to mimic a real rate plan.
      freeCancellation: i === 0 ? false : hotel.freeCancellation || rnd.chance(0.4),
      payAtHotel: hotel.payAtHotel && i > 0,
      roomsLeft: rnd.int(1, 9),
      amenities: rnd.sample(ROOM_AMENITIES, 4),
      image: ROOM_IMAGES[(i + rnd.int(0, ROOM_IMAGES.length)) % ROOM_IMAGES.length],
    };
  });
}

const FIRST_NAMES = ['Aarav', 'Mei', 'Liam', 'Sofia', 'Kenji', 'Priya', 'Lucas', 'Amelia', 'Noah', 'Hana', 'Omar', 'Chloé', 'Arjun', 'Emma', 'Somchai', 'Isabella'];
const COUNTRIES = ['India', 'Singapore', 'Japan', 'Australia', 'United Kingdom', 'United States', 'Thailand', 'Germany', 'France', 'Malaysia'];
const TRAVELER_TYPES: TravelerType[] = ['Solo', 'Couple', 'Family', 'Business', 'Group'];

const POSITIVE = [
  ['Fantastic stay', 'The staff went above and beyond. Rooms were spotless and the breakfast spread was incredible.'],
  ['Perfect location', 'Everything was walkable and the transit station was minutes away. Would definitely stay again.'],
  ['Great value', 'For the price this place is a steal. Comfortable beds, strong WiFi and a friendly front desk.'],
  ['Loved the pool', 'The pool area was the highlight - relaxing and never too crowded. Check-in was quick.'],
  ['Super clean and modern', 'Modern design, great shower pressure and very quiet at night. Highly recommended.'],
];
const MIXED = [
  ['Good but noisy', 'Nice room and helpful staff, but the street noise at night was noticeable.'],
  ['Decent stay', 'Location is good, though the room was smaller than expected. Breakfast could have more variety.'],
  ['Okay for a short trip', 'Clean and convenient, but the WiFi was patchy on the upper floors.'],
];

export function generateReviews(hotel: Hotel): Review[] {
  const rnd = createRandom(hashString(`${hotel.id}-reviews`));
  const count = rnd.int(14, 28);
  const reviews: Review[] = [];
  const now = Date.UTC(2026, 10, 1);

  for (let i = 0; i < count; i++) {
    const positive = rnd.chance(hotel.reviewScore / 11);
    const [title, comment] = rnd.pick(positive ? POSITIVE : MIXED);
    const score = positive ? rnd.float(Math.max(7.5, hotel.reviewScore - 0.6), 10) : rnd.float(5, 7.4);
    reviews.push({
      id: `${hotel.id}-rv${i + 1}`,
      hotelId: hotel.id,
      author: `${rnd.pick(FIRST_NAMES)} ${String.fromCharCode(65 + rnd.int(0, 25))}.`,
      country: rnd.pick(COUNTRIES),
      travelerType: rnd.pick(TRAVELER_TYPES),
      score,
      title,
      comment,
      date: new Date(now - rnd.int(1, 540) * 86_400_000).toISOString().slice(0, 10),
    });
  }
  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}
