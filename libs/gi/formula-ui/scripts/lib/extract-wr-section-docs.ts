// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulaCatalog } from '../../../formula/src/formulaCatalog'
import { parseWrFieldElement, type WrFieldRow } from '../wr-field-row-extract'
import {
  extractBraceContent,
  readWrSheetSource,
  type TalentSection,
} from '../wr-text-extract'

export type WrSectionDoc =
  | { kind: 'text'; expr: string }
  | { kind: 'fields'; rows: WrFieldRow[] }

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

function extractFieldsArrayInner(el: string): string | null {
  const fieldsIdx = el.indexOf('fields:')
  if (fieldsIdx === -1) return null
  const bracketStart = el.indexOf('[', fieldsIdx)
  if (bracketStart === -1) return null
  let depth = 0
  for (let i = bracketStart; i < el.length; i++) {
    const ch = el[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return el.slice(bracketStart + 1, i)
    }
  }
  return null
}

function hitArrCount(wrSrc: string, area: 'normal' | 'skill'): number {
  const m = wrSrc.match(
    new RegExp(`${area}:\\s*\\{[\\s\\S]*?hitArr:\\s*\\[([\\s\\S]*?)\\]`)
  )
  if (!m) return 0
  return (m[1].match(/skillParam_gen\.(?:auto|skill)\[[ab]\+\+\]/g) ?? [])
    .length
}

function parseMapBlockRows(
  inner: string,
  key: string,
  wrSrc: string,
  area: 'normal' | 'skill',
  section: TalentSection
): WrFieldRow[] {
  const count = hitArrCount(wrSrc, area)
  if (!count) return []

  const skillParamPrefix =
    section === 'auto' ? 'auto' : section === 'skill' ? 'skill' : section
  const rows: WrFieldRow[] = []

  for (let i = 0; i < count; i++) {
    const formulaName = `${area === 'normal' ? 'normal' : 'skill'}_${i}`
    if (!catalogNames(key).has(formulaName)) continue
    let multi: number | undefined
    const condMulti = inner.match(
      new RegExp(String.raw`\[${i}\][\s\S]*?multi:\s*(\d+)`)
    )
    if (condMulti) multi = Number(condMulti[1])
    else {
      const ternary = inner.match(
        new RegExp(String.raw`i === ${i}[^?]*\?\s*(\d+)`)
      )
      if (ternary) multi = Number(ternary[1])
    }
    rows.push({
      kind: 'formula',
      formulaName,
      title: `ct.chg(\`${skillParamPrefix}.skillParams.${i}\`)`,
      ...(multi ? { multi } : {}),
    })
  }
  return rows
}

function parseWrFieldsBlockInner(
  inner: string,
  key: string,
  wrSrc: string,
  section: TalentSection
): WrFieldRow[] {
  if (/dm\.normal\.hitArr\.map/.test(inner)) {
    return parseMapBlockRows(inner, key, wrSrc, 'normal', section)
  }
  if (/dm\.skill\.hitArr\.map/.test(inner)) {
    return parseMapBlockRows(inner, key, wrSrc, 'skill', section)
  }

  const rows: WrFieldRow[] = []
  for (const el of splitTopLevelElements(inner)) {
    const row = parseWrFieldElement(el, key, section)
    if (row) rows.push(row)
  }
  return rows
}

function catalogNames(key: string): Set<string> {
  return new Set(
    Object.keys(
      (formulaCatalog as Record<string, Record<string, unknown>>)[key] ?? {}
    )
  )
}

function parseStandaloneText(el: string): string | null {
  const m = el.match(
    /^\{\s*text:\s*(ct\.(?:chg|ch)\([^)]+\)|stg?\([^)]*\)|st\([^)]*\))/
  )
  return m?.[1] ?? null
}

/** WR section documents in sheet order (text headers + field blocks). */
export function extractWrSectionDocs(
  key: string,
  section: TalentSection
): WrSectionDoc[] {
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return []

  const content = findTalentSectionContent(wrSrc, section)
  if (!content) return []

  const docs: WrSectionDoc[] = []
  for (const el of splitTopLevelElements(content)) {
    if (/ct\.condTem\(/.test(el)) continue
    if (/ct\.headerTem\(/.test(el)) continue

    const textExpr = parseStandaloneText(el)
    if (textExpr) {
      docs.push({ kind: 'text', expr: textExpr })
      continue
    }

    let inner = extractFieldsArrayInner(el)
    if (inner === null && el.includes('ct.fieldsTem')) {
      const openBrace = el.indexOf('{')
      if (openBrace >= 0) {
        inner = extractFieldsArrayInner(extractBraceContent(el, openBrace))
      }
    }
    if (inner === null) continue

    const rows = parseWrFieldsBlockInner(inner, key, wrSrc, section)
    if (rows.length) docs.push({ kind: 'fields', rows })
  }

  return docs
}

export function hasWrSheet(key: string): boolean {
  return readWrSheetSource(key) !== null
}
