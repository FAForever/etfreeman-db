import { optimize } from 'svgo'
import { parseStringPromise } from 'xml2js'
import fs from 'fs'
import { resolve } from 'path'

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
}

const getSvgStats = async (str) => {
  const { svg: { $: attrs } } = await parseStringPromise(str)
  let { width = null, height = null, viewBox = null, fill = null } = attrs
  if (!viewBox && (width && height))
    viewBox = `0 0 ${width} ${height}`
  return { width, height, viewBox, fill }
}

export async function generateSVG(svgFolder, filename, resultFolder, withindex = true) {
  const filename_without_ext = filename.replace('.svg', '')

  console.log(`generating ${resultFolder}${filename.replace('.svg', '.js')}`)
  let name = filename.replace('_fixcolor', '').replace('.svg', '').trim()
  const content = fs.readFileSync(resolve(svgFolder, filename), 'utf8')
  let { data } = optimize(content)
  const stats = await getSvgStats(data)
  data = data.replace(/<svg[^>]*>/i, '').replace(/<\/svg>/, '')

  if (!filename.match('_fixcolor.svg')) {
    const colors = [...new Set(data.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g))]
    if (colors.length == 1) {
      data = data.replace(new RegExp(escapeRegex(colors[0]), 'g'), 'currentColor')
    }
    else if (colors.length) {
      colors.forEach((color, i) => {
        data = data.replace(new RegExp(escapeRegex(color), 'g'), `var(--color${i},${color})`)
      })
    }
  }

  const ids = data.match(/url\(#[^)]+\)/g)?.map(el => el.match(/#([^)]+)/)[1]) || []
  for (let id of ids) {
    data = data
      .replace(new RegExp(escapeRegex(`url(#${id})`), 'g'), `url(#${filename_without_ext}_${id})`)
      .replace(new RegExp(escapeRegex(`id="${id}"`), 'g'), `id="${filename_without_ext}_${id}"`)
  }

  fs.writeFileSync(resolve(resultFolder, filename.replace('.svg', '.js')),
    `export default ${JSON.stringify({ name, content: data, ...stats }, null, 2)}`
  )

  if (withindex) {
    const allfiles = fs.readdirSync(resultFolder)
      .filter(file => file.endsWith('.js') && file !== 'index.js')
    fs.writeFileSync(
      resolve(resultFolder, 'index.js'),
      allfiles.map(file => `export { default as ${file.replace('_fixcolor', '').replace('.js', '')} } from './${file}'`).join('\n')
    )
  }
}

let watcher

export function svgWatcherPlugin(svgFolder, resultFolder) {
  const svgPath = resolve(__dirname, svgFolder)
  const resultPath = resolve(__dirname, resultFolder)

  return {
    name: 'svg-watcher-plugin',
    buildStart() {
      const files = fs.readdirSync(svgPath).filter(file => file.endsWith('.svg'))
      const resultFiles = fs.readdirSync(resultPath).filter(file => file.endsWith('.js'))
      for (let file of resultFiles) {
        fs.unlinkSync(resolve(resultPath, file))
      }
      for (let file of files) {
        generateSVG(svgPath, file, resultPath, file === files[files.length - 1])
      }
    },
    configureServer() {
      watcher = fs.watch(svgPath, (eventType, filename) => {
        if (filename?.endsWith('.svg')) {
          if (eventType === 'change') {
            generateSVG(svgPath, filename, resultPath, true)
          }
        }
      })
    },
    closeBundle() {
      if (watcher) {
        watcher.close()
        watcher = null
      }
    },
  }
}
