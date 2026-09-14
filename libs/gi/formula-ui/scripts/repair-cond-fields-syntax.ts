/**
 * Repair broken charConditionalDocument syntax from migrate-wr-cond-fields.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

function repair(src: string): string {
  return src
    .replace(
      /charConditionalDocument\(key, cond\.(\w+)\),\s*\{\s*fields:/g,
      'charConditionalDocument(key, cond.$1, { fields:'
    )
    .replace(/\n\s*\]\s*\}\),/g, '\n      ],\n    }),')
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

console.log(`Repaired ${fixed} file(s)`)
