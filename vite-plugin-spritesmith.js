import binPack from 'bin-pack'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

/**
 * Custom Vite plugin for generating PNG sprite sheets using sharp and bin-pack
 */
export default function viteSpritesmith(options = {}) {
  const sprites = options.sprites || []
  let isWatching = false

  async function generateSprite(sprite) {
    const { name, src, imgDest, cssDest, cssImageRef, modifier } = sprite

    try {
      // Get all PNG files
      const files = fs.readdirSync(src)
        .filter(file => file.endsWith('.png'))
        .map(file => path.join(src, file))

      if (files.length === 0) {
        console.warn(`[spritesmith] No PNG files found in ${src}`)
        return
      }

      // Sort files alphabetically by basename for consistent order
      files.sort((a, b) => path.basename(a).localeCompare(path.basename(b)))

      // Get metadata, skipping invalid images
      const items = []
      let totalArea = 0
      for (const file of files) {
        try {
          const meta = await sharp(file).metadata()
          if (meta.width > 0 && meta.height > 0) {
            items.push({ width: meta.width, height: meta.height, file })
            totalArea += meta.width * meta.height
          } else {
            console.warn(`[spritesmith] Invalid dimensions for ${file} (skipping)`)
          }
        } catch (e) {
          console.error(`[spritesmith] Error reading ${file}:`, e)
        }
      }

      if (items.length === 0) {
        console.warn(`[spritesmith] No valid images for ${name}. Skipping.`)
        return
      }

      console.log(`[spritesmith] For ${name}: ${items.length} valid images, total area ${totalArea}`)

      // Pack items (modifies items in place with x, y)
      const packed = binPack(items, { inPlace: true })

      // Check if all items have positions
      if (!items.every(i => Number.isFinite(i.x) && Number.isFinite(i.y))) {
        throw new Error(`[spritesmith] Not all images packed for ${name}`)
      }

      // Create output dirs
      fs.mkdirSync(path.dirname(imgDest), { recursive: true })
      fs.mkdirSync(path.dirname(cssDest), { recursive: true })

      // Create transparent canvas and composite images
      const canvas = sharp({
        create: {
          width: packed.width,
          height: packed.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      await canvas
        .composite(items.map(item => ({ input: item.file, left: item.x, top: item.y })))
        .png({ quality: 100 })
        .toFile(imgDest)

      let cssContent = ''

      const iconClass = modifier ? `.icon_${modifier}` : `.icon`

      if (modifier === 'units') {
        const columnCount = 23
        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n`
        cssContent += `  background-size: calc(100% * ${columnCount}) auto\n\n`

        items.forEach(item => {
          const iconName = path.basename(item.file, '.png')

          const posXPercent = packed.width === item.width
            ? 0
            : (item.x / (packed.width - item.width)) * 100
          const posYPercent = packed.height === item.height
            ? 0
            : (item.y / (packed.height - item.height)) * 100

          cssContent += `.icon-${iconName}\n  background-position: ${posXPercent.toFixed(4)}% ${posYPercent.toFixed(4)}%\n`
        })
      } else {
        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n`
        cssContent += `  background-size: ${packed.width}px ${packed.height}px\n\n`

        items.forEach(item => {
          const iconName = path.basename(item.file, '.png')

          cssContent += `.icon-${iconName}\n`
          cssContent += `  width: ${item.width}px\n`
          cssContent += `  height: ${item.height}px\n`
          cssContent += `  background-position: -${item.x}px -${item.y}px\n`
        })
      }

      fs.writeFileSync(cssDest, cssContent)

      console.log(`[spritesmith] Generated ${name} sprite (${items.length} icons, size ${packed.width}x${packed.height})`)
    } catch (error) {
      console.error(`[spritesmith] Error generating ${name} sprite:`, error)
    }
  }

  async function generateAllSprites() {
    console.log('[spritesmith] Generating sprites...')
    for (const sprite of sprites) {
      await generateSprite(sprite)
    }
  }

  function setupWatcher(server) {
    if (isWatching) return
    isWatching = true

    // Watch sprite source directories using Vite's watcher
    const watchPaths = sprites.map(s => path.join(s.src, '*.png'))
    server.watcher.add(watchPaths)

    // Use chokidar for fine-grained control
    const watcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      persistent: true,
      ignored: sprites.map(s => s.cssDest) // Ignore generated CSS
    })

    watcher.on('all', async (event, filePath) => {
      console.log(`[spritesmith] File ${event}: ${filePath}`)
      const sprite = sprites.find(s => filePath.startsWith(s.src))
      if (sprite) {
        await generateSprite(sprite)
        // Notify Vite of CSS change
        const cssPath = sprite.cssDest
        if (fs.existsSync(cssPath)) {
          server.watcher.emit('change', cssPath)
        }
      }
    })

    console.log('[spritesmith] Watching sprite source files...')
  }

  return {
    name: 'vite-plugin-spritesmith',

    async configResolved() {
      // Generate sprites before server starts
      await generateAllSprites()
    },

    async configureServer(server) {
      // Setup watcher after server is ready
      setupWatcher(server)
    }
  }
}