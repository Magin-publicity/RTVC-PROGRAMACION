// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Habilitar PWA en desarrollo
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      // Estrategia de Service Worker
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      // Configuración del manifest
      manifest: false, // Usamos nuestro manifest.json personalizado
      // Incluir archivos
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      // NO generar SW automático, usamos el nuestro
      injectRegister: false,
      // Workbox options (solo si usas generateSW en lugar de injectManifest)
      workbox: {
        // Estas opciones se ignoran con 'injectManifest', pero las dejamos por si cambias
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    // CRÍTICO: Exponer el servidor en la red local
    host: '0.0.0.0', // Escuchar en todas las interfaces de red
    // Configuración adicional para red local
    strictPort: false, // Usar otro puerto si 5173 está ocupado
    open: false, // No abrir navegador automáticamente
    // CORS permisivo en desarrollo
    cors: true,
    // Proxy para el backend - funciona en localhost Y en IP de red
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Logs para debugging
        configure: (proxy, options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Proxy] Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Proxy]', req.method, req.url, '→', options.target);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimizaciones para producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lucide-react']
        }
      }
    }
  },
  // Configuración de preview (para probar el build)
  preview: {
    port: 4173,
    host: '0.0.0.0',
    strictPort: false,
    open: false
  }
});
