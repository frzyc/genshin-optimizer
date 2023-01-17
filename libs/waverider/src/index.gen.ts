import { readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

function* crawlDir(dir: string): Generator<string> {
  for (const subdir of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, subdir.name)
    if (subdir.isDirectory())
      yield* crawlDir(path)
    else yield path
  }
}

for (const file of crawlDir(__dirname)) {
  if (file === __filename) continue
  if (file.match(/\.gen\.tsx?$/)) {
    const data = require(file)
    writeFileSync(file.replace(/.ts$/, '.json'), JSON.stringify(data.default))
  }
}
