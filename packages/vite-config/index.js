import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { REMOTES, federatedRemotes, remoteUrl } from './remotes.js';

/**
 * Creates the Vite config for one micro frontend.
 *
 * @param {object} options
 * @param {string} options.dirname   Absolute path of the app (pass `import.meta.dirname`).
 * @param {string} options.name      Federation container name (must match a key in remotes.js).
 * @param {Record<string,string>} [options.exposes]  Modules this app exposes to others.
 * @param {string[]} [options.remotes]               Names of the containers this app consumes.
 */
export function createConfig({ dirname, name, exposes = {}, remotes = [] }) {
  const pkg = JSON.parse(readFileSync(join(dirname, 'package.json'), 'utf8'));
  const deps = pkg.dependencies ?? {};
  const { port } = REMOTES[name];
  const origin = remoteUrl(name);
  const isRemote = Object.keys(exposes).length > 0;

  return defineConfig(({ command }) => ({
    // Remotes use an absolute base so their chunks/assets resolve to *their* origin
    // even when the code is executed inside the shell's page.
    base: isRemote && command === 'build' ? `${origin}/` : '/',
    plugins: [
      react(),
      federation({
        name,
        filename: 'remoteEntry.js',
        exposes,
        remotes: federatedRemotes(remotes),
        // Remote CSS must travel with the exposed module, otherwise the host page renders unstyled.
        bundleAllCSS: isRemote,
        dts: false,
        shared: {
          react: { singleton: true, requiredVersion: deps.react },
          'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
          'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
          // Holds the global store + event bus, so there MUST be exactly one instance at runtime.
          '@mini-agoda/shared': { singleton: true, requiredVersion: false },
        },
      }),
    ],
    css: {
      modules: {
        // Prefix with the container name so class names can never collide across MFEs.
        generateScopedName: command === 'build' ? `${name}_[hash:base64:6]` : `${name}__[name]__[local]`,
      },
    },
    server: {
      port,
      strictPort: true,
      origin,
      cors: true,
    },
    preview: {
      port,
      strictPort: true,
      cors: true,
    },
    build: {
      // Module Federation relies on top-level await.
      target: 'esnext',
      sourcemap: true,
    },
  }));
}
