import { createConfig } from '@mini-agoda/vite-config';

export default createConfig({
  dirname: import.meta.dirname,
  name: 'account',
  exposes: {
    './AccountApp': './src/AccountApp.tsx',
    './UserMenu': './src/components/UserMenu.tsx',
  },
});
