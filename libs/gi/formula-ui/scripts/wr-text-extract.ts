import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const WR_CHAR_DIR = join(process.cwd(), 'libs/gi/sheets/src/Characters')

export const TALENT_SECTIONS = [
  'auto',
  'skill',
  'burst',
  'passive1',
  'passive2',
  'passive3',
  'constellation1',
  'constellation2',
  'constellation3',
  'constellation4',
  'constellation5',
  'constellation6',
] as const

export type TalentSection = (typeof TALENT_SECTIONS)[number]

export type WrTextDoc = {
  /** Pando `text:` expression, e.g. `ct.ch('aoeGems')` */
  expr: string
  targetSection: TalentSection
}

const STANDARD_AUTO_HEADERS = new Set([
  "ct.chg('auto.fields.normal')",
  "ct.chg('auto.fields.charged')",
  "ct.chg('auto.fields.plunging')",
])

const FIELD_LABEL_TEXT =
  /^ct\.chg\('(?:auto|skill|burst|passive\d+|constellation\d)\.skillParams\.\d+'\)$|^stg?\([^)]+\)$/

function wrSheetPath(key: string): string | null {
  const direct = join(WR_CHAR_DIR, key, 'index.tsx')
  if (existsSync(direct)) return direct
  const travelerF = join(WR_CHAR_DIR, `${key}F`, 'index.tsx')
  if (existsSync(travelerF)) return travelerF
  return null
}

/** Resolve WR talent source (Traveler element files, not index re-export). */
export function readWrSheetSource(key: string): string | null {
  const path = wrSheetPath(key)
  if (!path) return null
  const src = readFileSync(path, 'utf8')
  if (!src.includes('travelerSheet(')) return src

  const dir = dirname(path)
  const talentFile = readdirSync(dir).find(
    (f) => f.endsWith('.tsx') && f !== 'index.tsx'
  )
  if (!talentFile) return src
  return readFileSync(join(dir, talentFile), 'utf8')
}

export function extractBraceContent(src: string, openBraceIdx: number): string {
  let depth = 0
  for (let i = openBraceIdx; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return src.slice(openBraceIdx + 1, i)
    }
  }
  throw new Error('Unbalanced braces while parsing WR sheet')
}

function extractBracketContent(src: string, openBracketIdx: number): string {
  let depth = 0
  for (let i = openBracketIdx; i < src.length; i++) {
    const ch = src[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return src.slice(openBracketIdx + 1, i)
    }
  }
  throw new Error('Unbalanced brackets while parsing WR sheet')
}

function splitTopLevelElements(content: string): string[] {
  const elements: string[] = []
  let depth = 0
  let start = -1
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '(' || ch === '{' || ch === '[') {
      if (depth === 0) start = i
      depth++
    } else if (ch === ')' || ch === '}' || ch === ']') {
      depth--
      if (depth === 0 && start >= 0) {
        elements.push(content.slice(start, i + 1).trim())
        start = -1
      }
    }
  }
  return elements.filter(Boolean)
}

function normalizeTextExpr(raw: string): string | null {
  const expr = raw.trim().replace(/,\s*$/, '')
  if (!expr || expr.includes('<')) return null
  if (!/^(ct\.(?:chg|ch)|stg?)\(/.test(expr)) return null
  if (STANDARD_AUTO_HEADERS.has(expr)) return null
  if (FIELD_LABEL_TEXT.test(expr)) return null
  if (/\.description'\)$/.test(expr)) return null
  return expr
}

export function findClosingBracket(
  src: string,
  openBracketIdx: number
): number {
  let depth = 0
  for (let i = openBracketIdx; i < src.length; i++) {
    const ch = src[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return i
    }
  }
  throw new Error('Unbalanced brackets while parsing WR sheet')
}

function stripHeaderTemBlocks(content: string): string {
  let out = ''
  let cursor = 0
  const re = /ct\.headerTem\('[^']+',\s*\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    out += content.slice(cursor, m.index)
    const openBrace = m.index + m[0].length - 1
    let depth = 0
    let end = openBrace
    for (let i = openBrace; i < content.length; i++) {
      if (content[i] === '{') depth++
      else if (content[i] === '}') {
        depth--
        if (depth === 0) {
          end = content.indexOf(')', i)
          if (end === -1) end = i
          else end += 1
          break
        }
      }
    }
    cursor = end
  }
  out += content.slice(cursor)
  return out
}

const TEXT_EXPR = String.raw`(ct\.(?:chg|ch)\([^)]+\)|stg?\([^)]*\))`

function extractStandaloneTextObjects(content: string): string[] {
  const out: string[] = []
  const stripped = stripHeaderTemBlocks(content)
  const re = new RegExp(String.raw`\{\s*text:\s*${TEXT_EXPR}\s*,?\s*\}`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped))) {
    const expr = normalizeTextExpr(m[1])
    if (expr) out.push(expr)
  }
  return out
}

function extractAllHeaderTemTexts(
  content: string
): { target: TalentSection; expr: string }[] {
  const out: { target: TalentSection; expr: string }[] = []
  const re = /ct\.headerTem\('([^']+)',\s*\{/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    const target = m[1] as TalentSection
    if (!TALENT_SECTIONS.includes(target)) continue
    const openBrace = m.index + m[0].length - 1
    const objContent = extractBraceContent(content, openBrace)
    const fieldsMatch = objContent.match(/fields:\s*\[([\s\S]*)\]/)
    if (!fieldsMatch) continue

    for (const fieldEl of splitTopLevelElements(fieldsMatch[1])) {
      if (/\bnode\s*:/.test(fieldEl)) continue
      const textMatch = fieldEl.match(
        new RegExp(String.raw`\btext:\s*${TEXT_EXPR}`)
      )
      if (!textMatch) continue
      const expr = normalizeTextExpr(textMatch[1])
      if (expr) out.push({ target, expr })
    }
  }
  return out
}

function findTalentSectionContent(
  wrSrc: string,
  section: TalentSection
): string | null {
  const needle = `${section}: ct.talentTem('${section}', [`
  const idx = wrSrc.indexOf(needle)
  if (idx === -1) return null
  const openBracket = idx + needle.length - 1
  return extractBracketContent(wrSrc, openBracket)
}

/** WR text documents to mirror in Pando `{ type: 'text', text: … }`. */
export function extractWrTextDocs(
  key: string
): Map<TalentSection, WrTextDoc[]> {
  const path = wrSheetPath(key)
  const result = new Map<TalentSection, WrTextDoc[]>()
  for (const section of TALENT_SECTIONS) result.set(section, [])
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return result
  for (const section of TALENT_SECTIONS) {
    const content = findTalentSectionContent(wrSrc, section)
    if (!content) continue

    const seen = new Set<string>()
    const add = (targetSection: TalentSection, expr: string) => {
      const dedupeKey = `${targetSection}::${expr}`
      if (seen.has(dedupeKey)) return
      seen.add(dedupeKey)
      result.get(targetSection)!.push({ expr, targetSection })
    }

    for (const expr of extractStandaloneTextObjects(content)) {
      add(section, expr)
    }
    for (const { target, expr } of extractAllHeaderTemTexts(content)) {
      add(target, expr)
    }
  }

  return result
}

export function textDocLine(expr: string): string {
  return `    {
      type: 'text',
      text: ${expr},
    }`
}

export function readWrSheet(key: string): string | null {
  return readWrSheetSource(key)
}
