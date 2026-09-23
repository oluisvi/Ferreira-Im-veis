import { put } from '@vercel/blob'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, extname } from 'node:path'

const root = process.argv[2]
if (!root) throw new Error('Informe a pasta raiz das imagens.')

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(absolute))
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) files.push(absolute)
  }
  return files
}

const files = await walk(root)
const manifest = []
for (const file of files) {
  const rel = relative(root, file).replaceAll('\\', '/')
  const pathname = `imoveis/${rel}`
  const blob = await put(pathname, await readFile(file), {
    access: 'public',
    addRandomSuffix: false,
    contentType: extname(file).toLowerCase() === '.png' ? 'image/png' : extname(file).toLowerCase() === '.webp' ? 'image/webp' : 'image/jpeg',
    allowOverwrite: true,
  })
  manifest.push({ file: rel, url: blob.url })
  console.log(`${manifest.length}/${files.length} ${rel}`)
}

await writeFile('image-manifest.json', JSON.stringify(manifest, null, 2), 'utf8')
console.log(`Manifesto salvo: image-manifest.json (${manifest.length} imagens)`)
