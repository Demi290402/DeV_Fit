import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const buildTime = Date.now();

const versionPlugin = () => ({
  name: 'version-generator',
  buildStart() {
    try {
      fs.writeFileSync('public/version.json', JSON.stringify({ version: '1.1.0', buildTime }), 'utf8');
    } catch {
      // ignore
    }
  }
});


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin()],
  define: {
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
  },
})

