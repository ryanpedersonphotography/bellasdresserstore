import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      }
    })
  ],
  build: {
    // Enable minification with terser for optimal bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    },
    // Multi-page app configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        shop: resolve(__dirname, 'shop.html'),
        contact: resolve(__dirname, 'contact.html'),
        visit: resolve(__dirname, 'visit.html'),
        faq: resolve(__dirname, 'faq.html'),
        reviews: resolve(__dirname, 'reviews.html'),
        blog: resolve(__dirname, 'blog.html')
      },
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps only for development
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  // Enable compression
  server: {
    middlewareMode: false,
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})