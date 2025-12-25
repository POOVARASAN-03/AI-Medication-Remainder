import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-firebase-config-sw',
      writeBundle() {
        // Generate firebase-config-sw.js with actual environment variables
        const configContent = `// This file is auto-generated during build from environment variables
self.FIREBASE_CONFIG = {
  apiKey: "${process.env.VITE_FIREBASE_API_KEY}",
  authDomain: "${process.env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.VITE_FIREBASE_APP_ID}",
};

self.API_URL = "${process.env.VITE_API_URL || 'http://localhost:3000'}";
`;
        const distPath = path.resolve(__dirname, 'dist');
        if (fs.existsSync(distPath)) {
          fs.writeFileSync(path.join(distPath, 'firebase-config-sw.js'), configContent);
          console.log('✅ Generated firebase-config-sw.js with environment variables');
        }
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Updated to match server port
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Removed to preserve /api prefix
      },
    },
  },
})
