import { createConfig } from '@mini-agoda/vite-config';

export default createConfig({
  dirname: import.meta.dirname,
  name: 'hotel',
  exposes: {
    './HotelPage': './src/pages/HotelPage.tsx',
  },
});
