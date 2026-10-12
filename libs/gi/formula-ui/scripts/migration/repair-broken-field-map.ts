/**
 * Remove erroneous `.map(({ tag }) => …)` suffixes on field arrays that
 * already contain `{ fieldRef: … }` objects (parity migration corruption).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

const brokenMapRe =
  /(\n\s+fields: \[)([\s\S]*?)(\]\.map\(\(\{ tag \}, i\) => \(\{[\s\S]*?fieldRef: tag,[\s\S]*?\}\)\),)/g

function repair(src: string): string {
  return src.replace(brokenMapRe, (full, prefix, inner, mapPart) => {
    if (/^\s*formula\./m.test(inner.trim())) return full
    return `${prefix}${inner}],`
  })
}

let fixed = 0
for (const file of readdirSync(sheetsDir).filter((f) => f.endsWith('.tsx'))) {
  const path = join(sheetsDir, file)
  const src = readFileSync(path, 'utf8')
  const next = repair(src)
  if (next !== src) {
    writeFileSync(path, next)
    fixed++
    console.log(`repaired ${file}`)
  }
}

console.log(`Repaired ${fixed} sheet(s)`)
