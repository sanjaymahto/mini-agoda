import { Link } from 'react-router-dom';
import { Skeleton } from '@mini-agoda/shared';
import { createRemote } from './createRemote';

/** Every federated module the shell composes. Routes live in App.tsx. */
export const HomePage = createRemote('search', 'HomePage', () => import('search/HomePage'));
export const SearchPage = createRemote('search', 'SearchPage', () => import('search/SearchPage'));
export const HotelPage = createRemote('hotel', 'HotelPage', () => import('hotel/HotelPage'));
export const BookingApp = createRemote('booking', 'BookingApp', () => import('booking/BookingApp'));
export const AccountApp = createRemote('account', 'AccountApp', () => import('account/AccountApp'));

/** A fragment (not a page): the account team owns the header's user menu. */
export const UserMenu = createRemote('account', 'UserMenu', () => import('account/UserMenu'), {
  loading: <Skeleton width={96} height={36} />,
  errorFallback: () => <Link to="/account/login">Sign in</Link>,
});
