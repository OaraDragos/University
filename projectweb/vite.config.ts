import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const useHttps = process.env.HTTPS === 'true';
const pfxPath = process.env.HTTPS_PFX_FILE ?? join(process.cwd(), 'backend', 'certs', 'devcert.pfx');
const pfxPassphrase = process.env.HTTPS_PFX_PASSPHRASE ?? 'silver-dev';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: useHttps
      ? {
          pfx: readFileSync(pfxPath),
          passphrase: pfxPassphrase,
        }
      : undefined,
  },
});
