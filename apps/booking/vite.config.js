import { createConfig } from '@mini-agoda/vite-config';

export default createConfig({
  dirname: import.meta.dirname,
  name: 'booking',
  exposes: {
    './BookingApp': './src/BookingApp.tsx',
  },
});
