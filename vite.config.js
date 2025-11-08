import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'path'
import viteSpritesmith from './vite-plugin-spritesmith.js'

const publicDir = join(__dirname, 'src', 'public')
const sassDir = join(__dirname, 'src', 'sass')
const distDir = join(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    viteSpritesmith({
      sprites: [
        {
          name: 'ui',
          src: './src/public/img/ui',
          imgDest: join(publicDir, 'img', 'ui.png'),
          cssDest: join(sassDir, 'generated', 'ui_sprites.sass'),
          cssImageRef: '/img/ui.png',
          modifier: 'ui'
        },
        {
          name: 'strategic',
          src: './src/public/img/strategic',
          imgDest: join(publicDir, 'img', 'strategic.png'),
          cssDest: join(sassDir, 'generated', 'strategic_sprites.sass'),
          cssImageRef: '/img/strategic.png',
          modifier: 'strategic'
        },
        {
          name: 'units',
          src: './src/public/img/units',
          imgDest: join(publicDir, 'img', 'units.png'),
          cssDest: join(sassDir, 'generated', 'units_sprites.sass'),
          cssImageRef: '/img/units.png',
          modifier: 'units'
        }
      ]
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
          `@use '@/sass/abstracts/vars.sass'`,
          `@use '@/sass/abstracts/colors.sass'`,
          `@use '@/sass/abstracts/mixins.sass' as *`,
          `@use "sass:color"`,
          `@use "sass:math"`,
        ].join('\n')
      }
    }
  }
}))