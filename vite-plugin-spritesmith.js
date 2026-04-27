import binPack from 'bin-pack'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import chokidar from 'chokidar'

/**
 * Custom Vite plugin for generating PNG sprite sheets using sharp and bin-pack
 */
const HQ_REMAP = {
  UEB0201: 'ZEB9501', UEB0202: 'ZEB9502', UEB0203: 'ZEB9503',
  UEB0301: 'ZEB9601', UEB0302: 'ZEB9602', UEB0303: 'ZEB9603',
  URB0201: 'ZRB9501', URB0202: 'ZRB9502', URB0203: 'ZRB9503',
  URB0301: 'ZRB9601', URB0302: 'ZRB9602', URB0303: 'ZRB9603',
  UAB0201: 'ZAB9501', UAB0202: 'ZAB9502', UAB0203: 'ZAB9503',
  UAB0301: 'ZAB9601', UAB0302: 'ZAB9602', UAB0303: 'ZAB9603',
  XSB0201: 'ZSB9501', XSB0202: 'ZSB9502', XSB0203: 'ZSB9503',
  XSB0301: 'ZSB9601', XSB0302: 'ZSB9602', XSB0303: 'ZSB9603',
}
const EGG_REMAP = { XRL0003: 'XRL0305', DRLK005: 'DRLK001', XRL0005: 'URL0304', XRL0004: 'URL0205', XRL0002: 'URL0309' }
const REMAP = { ...HQ_REMAP, ...EGG_REMAP }
const REMAP_IDS = new Set(Object.keys(REMAP))
const FACTIONS = ['UEF', 'AEON', 'CYBRAN', 'SERAPHIM']

function prepareUnitSprites(spriteConfigs, publicDir) {
  const index = JSON.parse(fs.readFileSync(path.join(publicDir, 'data', 'index.json'), 'utf8'))
  const unitsSrc = spriteConfigs.find(s => s.modifier === 'units')?.src
  if (!unitsSrc) return

  const allPngIds = new Set(fs.readdirSync(unitsSrc).filter(f => f.endsWith('.png')).map(f => f.replace('.png', '')))
  const nomadsIds = new Set(index.units.filter(u => u.Categories?.includes('NOMADS')).map(u => u.Id))

  const factionIndexOf = {}
  for (const u of index.units) factionIndexOf[u.Id] = FACTIONS.indexOf(u.Categories?.find(c => FACTIONS.includes(c)))

  for (const sprite of spriteConfigs) {
    if (sprite.modifier === 'units') {
      sprite.exclude = nomadsIds.union(REMAP_IDS)
      sprite.remap = REMAP
      sprite.comparator = (a, b) => {
        const diff = factionIndexOf[a] - factionIndexOf[b]
        return diff || a.localeCompare(b)
      }
    } else if (sprite.modifier === 'nomads') {
      sprite.exclude = allPngIds.difference(nomadsIds)
    }
  }
}

export default function viteSpritesmith(options = {}) {
  const spriteConfigs = options.sprites || []
  let isWatching = false
  let isProduction = false

  async function generateSprite(sprite) {
    const { name, src, imgDest, cssDest, cssImageRef, modifier, exclude, remap, comparator } = sprite

    try {
      let files = fs.readdirSync(src)
        .filter(file => file.endsWith('.png'))
        .map(file => path.join(src, file))

      if (exclude) {
        const excludeSet = exclude instanceof Set ? exclude : new Set(exclude)
        files = files.filter(f => !excludeSet.has(path.basename(f, '.png')))
      }

      if (files.length === 0) {
        console.warn(`[spritesmith] No PNG files found in ${src}`)
        return
      }

      const sort = comparator || ((a, b) => a.localeCompare(b))
      files.sort((a, b) => sort(path.basename(a, '.png'), path.basename(b, '.png')))

      const isGrid = modifier === 'units' || modifier === 'nomads'
      const TILE = 64
      const MAX_W = 16384

      let items, packed

      if (isGrid) {
        const cols = Math.floor(MAX_W / TILE)
        const ALPHA_THRESHOLD = 76
        items = []
        for (const file of files) {
          const raw = await sharp(file).ensureAlpha().raw().toBuffer()
          for (let i = 3; i < raw.length; i += 4) {
            if (raw[i] <= ALPHA_THRESHOLD) raw[i] = 0
          }
          const scrubbed = await sharp(Buffer.from(raw), { raw: { width: TILE, height: TILE, channels: 4 } }).png().toBuffer()
          items.push({ width: TILE, height: TILE, id: path.basename(file, '.png'), file: scrubbed })
        }
        let x = 0, y = 0
        for (const item of items) {
          item.x = x
          item.y = y
          x += TILE
          if (x + TILE > MAX_W) { x = 0; y += TILE }
        }
        packed = { width: cols * TILE, height: (y || 0) + TILE }
      } else {
        items = []
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
        packed = binPack(items, { inPlace: true })
        if (!items.every(i => Number.isFinite(i.x) && Number.isFinite(i.y))) {
          throw new Error(`[spritesmith] Not all images packed for ${name}`)
        }
      }

      // Create output dirs
      fs.mkdirSync(path.dirname(imgDest), { recursive: true })
      fs.mkdirSync(path.dirname(cssDest), { recursive: true })

      // Create transparent canvas and composite images
      const compositeOps = items.map(item => ({ input: item.file, left: item.x, top: item.y }))

      // Generate PNG
      const isPaletteSprite = modifier === 'ui' || modifier === 'strategic'
      const pngOpts = isPaletteSprite
        ? { palette: true, colours: modifier === 'strategic' ? 16 : 64, effort: 10, compressionLevel: 9 }
        : { quality: 100 }
      await sharp({
        create: {
          width: packed.width,
          height: packed.height,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite(compositeOps)
        .png(pngOpts)
        .toFile(imgDest)

      // Generate AVIF for units/nomads sprites
      if (isGrid) {
        const avifDest = imgDest.replace('.png', '.avif')
        await sharp({
          create: {
            width: packed.width,
            height: packed.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .composite(compositeOps)
          .avif({ quality: 30, effort: isProduction ? 9 : 2 })
          .toFile(avifDest)
      }

      let cssContent = ''

      const iconClass = modifier ? `.icon_${modifier}` : `.icon`

      if (isGrid) {
        const columnCount = packed.width / TILE
        const avifRef = cssImageRef.replace('.png', '.avif')

        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${avifRef})\n`
        cssContent += `  background-size: calc(100% * ${columnCount}) auto\n`

        cssContent += `.no-avif ${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n\n`

        items.forEach(item => {
          const posXPercent = packed.width === item.width ? 0 : (item.x / (packed.width - item.width)) * 100
          const posYPercent = packed.height === item.height ? 0 : (item.y / (packed.height - item.height)) * 100
          cssContent += `.icon-${item.id}\n  background-position: ${posXPercent.toFixed(4)}% ${posYPercent.toFixed(4)}%\n`
        })

        if (remap) {
          for (const [alias, target] of Object.entries(remap)) {
            const targetItem = items.find(i => i.id === target)
            if (targetItem) {
              const posX = packed.width === targetItem.width ? 0 : (targetItem.x / (packed.width - targetItem.width)) * 100
              const posY = packed.height === targetItem.height ? 0 : (targetItem.y / (packed.height - targetItem.height)) * 100
              cssContent += `.icon-${alias}\n  background-position: ${posX.toFixed(4)}% ${posY.toFixed(4)}%\n`
            }
          }
        }
      } else if (modifier === 'ui') {
        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n`
        cssContent += `  background-size: ${packed.width}px ${packed.height}px\n\n`

        const factionIconNames = []
        items.forEach(item => {
          const iconName = path.basename(item.file, '.png')
          if (['uef', 'cybran', 'aeon', 'seraphim', 'nomads'].includes(iconName.toLowerCase())) {
            factionIconNames.push(iconName)
          }
          const posX = packed.width === item.width ? 0 : (item.x / (packed.width - item.width)) * 100
          const posY = packed.height === item.height ? 0 : (item.y / (packed.height - item.height)) * 100
          cssContent += `.icon-${iconName}\n`
          cssContent += `  width: ${item.width}px\n`
          cssContent += `  height: ${item.height}px\n`
          cssContent += `  background-position: ${posX.toFixed(4)}% ${posY.toFixed(4)}%\n`
        })
        console.log(`[spritesmith] Faction icons found: ${factionIconNames.join(', ')}`)
        console.log(`[spritesmith] Faction CSS classes: .icon-${factionIconNames.join(', .icon-')}`)
      } else if (modifier === 'ui-scalable') {
        const columnCount = Math.round(packed.width / 48)

        let defaultPosition = '0.0000% 0.0000%'

        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n`
        cssContent += `  background-size: calc(100% * ${columnCount}) auto\n`
        cssContent += `  background-position: ${defaultPosition}\n\n`

        items.forEach(item => {
          const iconName = path.basename(item.file, '.png')
          const posX = packed.width === item.width ? 0 : (item.x / (packed.width - item.width)) * 100
          const posY = packed.height === item.height ? 0 : (item.y / (packed.height - item.height)) * 100
          cssContent += `.icon-${iconName}\n  background-position: ${posX.toFixed(4)}% ${posY.toFixed(4)}%\n`
        })
      } else {
        cssContent += `${iconClass}\n`
        cssContent += `  background-image: url(${cssImageRef})\n`
        cssContent += `  background-size: ${packed.width}px ${packed.height}px\n\n`

        items.forEach(item => {
          const iconName = path.basename(item.file, '.png')

          cssContent += `.icon-${iconName.toLowerCase()}\n`
          cssContent += `  width: ${item.width}px\n`
          cssContent += `  height: ${item.height}px\n`
          cssContent += `  background-position: -${item.x}px -${item.y}px\n`
        })
      }

      fs.writeFileSync(cssDest, cssContent)

      console.log(`[spritesmith] Generated ${name} sprite (${items.length} icons, size ${packed.width}x${packed.height})`)
      console.log(`[spritesmith] CSS saved to: ${cssDest}`)
    } catch (error) {
      console.error(`[spritesmith] Error generating ${name} sprite:`, error)
    }
  }

  async function generateAllSprites() {
    console.log('[spritesmith] Generating sprites...')
    for (const sprite of spriteConfigs) {
      await generateSprite(sprite)
    }
  }

  function setupWatcher(server) {
    if (isWatching) return
    isWatching = true

    // Watch sprite source directories using Vite's watcher
    const watchPaths = spriteConfigs.map(s => path.join(s.src, '*.png'))
    server.watcher.add(watchPaths)

    const watcher = chokidar.watch(watchPaths, {
      ignoreInitial: true,
      persistent: true,
      ignored: spriteConfigs.map(s => s.cssDest)
    })

    watcher.on('all', async (event, filePath) => {
      console.log(`[spritesmith] File ${event}: ${filePath}`)
      const sprite = spriteConfigs.find(s => filePath.startsWith(s.src))
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

    async configResolved(config) {
      isProduction = config.isProduction
      prepareUnitSprites(spriteConfigs, options.publicDir)
      await generateAllSprites()
    },

    async configureServer(server) {
      // Setup watcher after server is ready
      setupWatcher(server)
    }
  }
}