import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'path'
import viteSpritesmith from './vite-plugin-spritesmith.js'
import { svgWatcherPlugin } from './vite-plugin-svgmaker.js'
import { VitePWA } from 'vite-plugin-pwa'

const publicDir = join(__dirname, 'src', 'public')
const assetsDir = join(__dirname, 'src', 'assets')
const sassDir = join(__dirname, 'src', 'sass')
const distDir = join(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    vue(),
    svgWatcherPlugin('./src/assets/img/embed_icons/', './src/data/svgicons/'),
    viteSpritesmith({
      sprites: [
        {
          name: 'ui',
          src: join(assetsDir, 'img', 'ui'),
          imgDest: join(publicDir, 'img', 'ui.png'),
          cssDest: join(sassDir, 'generated', 'ui_sprites.sass'),
          cssImageRef: '/img/ui.png',
          modifier: 'ui'
        },
        {
          name: 'strategic',
          src: join(assetsDir, 'img', 'strategic'),
          imgDest: join(publicDir, 'img', 'strategic.png'),
          cssDest: join(sassDir, 'generated', 'strategic_sprites.sass'),
          cssImageRef: '/img/strategic.png',
          modifier: 'strategic'
        },
        {
          name: 'units',
          src: join(assetsDir, 'img', 'units'),
          imgDest: join(publicDir, 'img', 'units.png'),
          cssDest: join(sassDir, 'generated', 'units_sprites.sass'),
          cssImageRef: '/img/units.png',
          modifier: 'units'
        }
      ]
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-precomposed.png'],
      manifest: {
        name: 'FAF Unit Database',
        short_name: 'FAF Units',
        description: 'Supreme Commander: Forged Alliance Forever unit database',
        theme_color: '#131313',
        background_color: '#131313',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,avif,webp,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/sw\.js$/, /^\/workbox-.*\.js$/, /^\/registerSW\.js$/, /^\/manifest\.webmanifest$/]
      }
    })
  ],
  base: process.env.GITHUB_ACTIONS ? '/etfreeman-db/' : '/',
  root: './src',
  publicDir: 'public',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 9001,
    open: true,
    fs: {
      allow: ['..']
    },
    watch: {
      ignored: [
        join(distDir, 'img', '*.png'),
        join(sassDir, 'generated', '*_sprites.sass')
      ]
    }
  },
  preview: {
    port: 9001
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern',
        additionalData: [
          `@use '@/sass/abstracts/colors.sass'`,
          `@use '@/sass/abstracts/mixins.sass' as *`,
          `@use "sass:color"`,
          `@use "sass:math"`,
        ].join('\n')
      }
    }
  }
}))