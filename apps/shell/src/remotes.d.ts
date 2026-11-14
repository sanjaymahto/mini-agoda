/**
 * Type declarations for every module exposed by a remote.
 * Keep in sync with the `exposes` map in each remote's webpack.config.js
 * and with docs/MICRO_FRONTENDS.md.
 */
declare module 'search/HomePage' {
  const HomePage: import('react').ComponentType;
  export default HomePage;
}

declare module 'search/SearchPage' {
  const SearchPage: import('react').ComponentType;
  export default SearchPage;
}

declare module 'hotel/HotelPage' {
  const HotelPage: import('react').ComponentType;
  export default HotelPage;
}

declare module 'booking/BookingApp' {
  const BookingApp: import('react').ComponentType;
  export default BookingApp;
}

declare module 'account/AccountApp' {
  const AccountApp: import('react').ComponentType;
  export default AccountApp;
}

declare module 'account/UserMenu' {
  const UserMenu: import('react').ComponentType;
  export default UserMenu;
}
