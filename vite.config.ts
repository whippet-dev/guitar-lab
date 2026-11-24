import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function offlineBuild(): Plugin {
  let output: string
  let workerSource: string
  return {
    name: 'guitar-lab-offline',
    apply: 'build',
    configResolved(config) {
      output = resolve(config.root, config.build.outDir)
      workerSource = resolve(config.root, 'scripts/service-worker.js')
    },
    async closeBundle() {
      const source = await readFile(workerSource, 'utf8')
      const entries = await readdir(output, { recursive: true, withFileTypes: true })
      const paths = entries.filter((entry) => entry.isFile() && entry.name !== 'sw.js')
        .map((entry) => resolve(entry.parentPath, entry.name)).sort()
      const hash = createHash('sha256').update(source)
      const assets = []
      for (const path of paths) {
        const asset = path.slice(output.length + 1).replaceAll('\\', '/')
        hash.update(asset).update(await readFile(path))
        assets.push(asset)
      }
      const worker = source.replace('__BUILD_VERSION__', JSON.stringify(hash.digest('hex').slice(0, 16)))
        .replace('__BUILD_ASSETS__', JSON.stringify(assets))
      await writeFile(resolve(output, 'sw.js'), worker)
    },
  }
}

export default defineConfig({ base: './', plugins: [react(), offlineBuild()] })
