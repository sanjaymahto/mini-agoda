const unsplash = (id: string, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;

export const HOTEL_EXTERIOR_IMAGES = [
  'photo-1566073771259-6a8506099945',
  'photo-1542314831-068cd1dbfeeb',
  'photo-1551882547-ff40c63fe5fa',
  'photo-1520250497591-112f2f40a3f4',
  'photo-1571896349842-33c89424de2d',
  'photo-1582719478250-c89cae4dc85b',
  'photo-1564501049412-61c2a3083791',
  'photo-1596394516093-501ba68a0ba6',
].map((id) => unsplash(id));

export const ROOM_IMAGES = [
  'photo-1611892440504-42a792e24d32',
  'photo-1590490360182-c33d57733427',
  'photo-1631049307264-da0ec9d70304',
  'photo-1618773928121-c32242e63f39',
  'photo-1578683010236-d716f9a3f461',
  'photo-1566665797739-1674de7a421a',
].map((id) => unsplash(id, 700));

export const CITY_IMAGES: Record<string, string> = {
  bangkok: unsplash('photo-1508009603885-50cf7c579365', 700),
  singapore: unsplash('photo-1525625293386-3f8f99389edd', 700),
  tokyo: unsplash('photo-1540959733332-eab4deabeeaf', 700),
  bali: unsplash('photo-1537996194471-e657df975ab4', 700),
  dubai: unsplash('photo-1512453979798-5ea266f8880c', 700),
  paris: unsplash('photo-1502602898657-3e91760cbb34', 700),
  mumbai: unsplash('photo-1529253355930-ddbe423a2ac7', 700),
  phuket: unsplash('photo-1589394815804-964ed0be2eb5', 700),
};

/** Used by <SmartImage> when a remote image fails to load. */
export const fallbackImage = (seed: string, width = 800, height = 520) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
