import type { City } from '../types';
import { CITY_IMAGES } from './images';

export const CITIES: City[] = [
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', tagline: 'Temples, street food & rooftop bars', propertyCount: 0, image: CITY_IMAGES.bangkok },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', tagline: 'Garden city of the future', propertyCount: 0, image: CITY_IMAGES.singapore },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', tagline: 'Neon nights & ancient shrines', propertyCount: 0, image: CITY_IMAGES.tokyo },
  { id: 'bali', name: 'Bali', country: 'Indonesia', tagline: 'Rice terraces & surf beaches', propertyCount: 0, image: CITY_IMAGES.bali },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', tagline: 'Skyscrapers & desert safaris', propertyCount: 0, image: CITY_IMAGES.dubai },
  { id: 'paris', name: 'Paris', country: 'France', tagline: 'Cafés, art & the Eiffel Tower', propertyCount: 0, image: CITY_IMAGES.paris },
  { id: 'mumbai', name: 'Mumbai', country: 'India', tagline: 'The city that never sleeps', propertyCount: 0, image: CITY_IMAGES.mumbai },
  { id: 'phuket', name: 'Phuket', country: 'Thailand', tagline: 'Turquoise bays & island hopping', propertyCount: 0, image: CITY_IMAGES.phuket },
];
