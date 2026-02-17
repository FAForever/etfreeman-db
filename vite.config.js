import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, join } from 'path'
import { writeFileSync, appendFileSync, unlinkSync, existsSync } from 'fs'
import viteSpritesmith from './vite-plugin-spritesmith.js'
import { svgWatcherPlugin } from './vite-plugin-svgmaker.js'

const logFile = join(__dirname, 'browser_console.log')

function browserLogPlugin() {
  return {
    name: 'browser-log-to-file',
    configureServer(server) {
      writeFileSync(logFile, '')

      server.middlewares.use('/__browser_log__', (req, res) => {
        let body = ''
        req.on('data', chunk => body += chunk)
        req.on('end', () => {
          try {
            const { type, args } = JSON.parse(body)
            const time = new Date().toLocaleTimeString()
            const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '📌'
            appendFileSync(logFile, `[${time}] ${prefix} ${args.join(' ')}\n`)
          } catch {}
          res.end()
        })
      })
    },
    handleHotUpdate() {
      writeFileSync(logFile, '')
    },
    transformIndexHtml(html) {
      return html.replace('</head>', `
<script>
(() => {
  const send = (type, args) => fetch('/__browser_log__', {
    method: 'POST',
    body: JSON.stringify({ type, args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)) })
  }).catch(() => {})
  ;['log','warn','error','info'].forEach(m => {
    const orig = console[m]
    console[m] = (...args) => { send(m, args); orig.apply(console, args) }
  })
  window.onerror = (msg, url, line) => send('error', [msg, 'at', url + ':' + line])
})()
</script></head>`)
    }
  }
}

const publicDir = join(__dirname, 'src', 'public')
const assetsDir = join(__dirname, 'src', 'assets')
const sassDir = join(__dirname, 'src', 'sass')
const distDir = join(__dirname, 'dist')

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    vue(),
    browserLogPlugin(),
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