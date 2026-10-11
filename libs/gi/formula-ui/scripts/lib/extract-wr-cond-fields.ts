import type { WrCondPlacement } from '../wr-conditional-extract'
import { parseWrFieldElement, type WrFieldRow } from '../wr-field-row-extract'
import { extractBraceContent, readWrSheetSource } from '../wr-text-extract'

function buildPathToCondName(wrSrc: string): Map<string, string> {
  const pathToName = new Map<string, string>()
  const condDeclRe =
    /const \[(\w+),\s*(\w+)\]\s*=\s*cond\(\s*[\s\S]*?'([^']+)'\s*\)/g
  let m: RegExpExecArray | null
  while ((m = condDeclRe.exec(wrSrc))) {
    pathToName.set(m[1], m[3])
    pathToName.set(m[2], m[3])
  }
  return pathToName
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

/** WR condTem `on` state field rows keyed by Pando conditional name. */
export function extractWrCondFieldRows(key: string): Map<string, WrFieldRow[]> {
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return new Map()

  const pathToName = buildPathToCondName(wrSrc)
  const result = new Map<string, WrFieldRow[]>()
  const condTemRe = /ct\.condTem\('([^']+)',\s*\{/g
  let m: RegExpExecArray | null

  while ((m = condTemRe.exec(wrSrc))) {
    const section = m[1]
    const openBrace = m.index + m[0].length - 1
    const obj = extractBraceContent(wrSrc, openBrace)
    const pathMatch = obj.match(/path:\s*(\w+)/)
    const valueMatch = obj.match(/value:\s*(\w+)/)
    const condName =
      (pathMatch && pathToName.get(pathMatch[1])) ??
      (valueMatch && pathToName.get(valueMatch[1]))
    if (!condName) continue

    const labelMatch = obj.match(
      /name:\s*(ct\.(?:chg|ch)\([^)]+\)|st\([^)]*\))/
    )
    const statesMatch = obj.match(/states:\s*\{([\s\S]*)\}\s*,?\s*$/)
    if (!statesMatch) continue
    const firstStateFields = statesMatch[1].match(
      /fields:\s*\[([\s\S]*?)\]\s*,?\s*\}/
    )
    if (!firstStateFields) continue

    const rows: WrFieldRow[] = []
    for (const el of splitTopLevelElements(firstStateFields[1])) {
      const row = parseWrFieldElement(el, key, section as never)
      if (row) rows.push(row)
    }
    if (rows.length) result.set(condName, rows)
  }

  return result
}

export type WrCondRender = WrCondPlacement & {
  label?: string
  fields?: WrFieldRow[]
}

export function extractWrCondRenderInfo(key: string): WrCondRender[] {
  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return []

  const pathToName = buildPathToCondName(wrSrc)
  const fieldRows = extractWrCondFieldRows(key)
  const renders: WrCondRender[] = []
  const condTemRe = /ct\.condTem\('([^']+)',\s*\{/g
  let m: RegExpExecArray | null

  while ((m = condTemRe.exec(wrSrc))) {
    const section = m[1]
    const openBrace = m.index + m[0].length - 1
    const obj = extractBraceContent(wrSrc, openBrace)
    const pathMatch = obj.match(/path:\s*(\w+)/)
    const valueMatch = obj.match(/value:\s*(\w+)/)
    const condName =
      (pathMatch && pathToName.get(pathMatch[1])) ??
      (valueMatch && pathToName.get(valueMatch[1]))
    if (!condName) continue

    const labelMatch = obj.match(
      /name:\s*(ct\.(?:chg|ch)\([^)]+\)|st\([^)]*\))/
    )
    renders.push({
      condName,
      section: section as WrCondPlacement['section'],
      teamBuff: /\bteamBuff:\s*true\b/.test(obj),
      ...(labelMatch ? { label: labelMatch[1] } : {}),
      ...(fieldRows.has(condName) ? { fields: fieldRows.get(condName) } : {}),
    })
  }

  return renders
}
