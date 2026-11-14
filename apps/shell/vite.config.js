import { createConfig } from '@mini-agoda/vite-config';

export default createConfig({
  dirname: import.meta.dirname,
  name: 'shell',
  remotes: ['search', 'hotel', 'booking', 'account'],
});
