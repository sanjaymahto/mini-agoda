import { createConfig } from '@mini-agoda/vite-config';

export default createConfig({
  dirname: import.meta.dirname,
  name: 'search',
  exposes: {
    './HomePage': './src/pages/HomePage.tsx',
    './SearchPage': './src/pages/SearchPage.tsx',
  },
});
