/** Add missing `st` import when sheet uses st() but only imports stg. */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')

let fixed = 0
for (const file of readdirSync(sheetsDir).filter((f) => f.endsWith('.tsx'))) {
  const path = join(sheetsDir, file)
  const src = readFileSync(path, 'utf8')
  if (!/\bst\(/.test(src)) continue
  if (/import \{[^}]*\bst\b/.test(src)) continue
  if (!/import \{ stg \} from '\.\.\/\.\.\/util'/.test(src)) continue
  const next = src.replace(
    "import { stg } from '../../util'",
    "import { st, stg } from '../../util'"
  )
  if (next !== src) {
    writeFileSync(path, next)
    fixed++
    console.log(`+st import ${file}`)
  }
}

console.log(`Fixed ${fixed} import(s)`)
