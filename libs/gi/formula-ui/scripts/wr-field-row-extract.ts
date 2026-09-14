import {
  readWrSheetSource,
  TALENT_SECTIONS,
  type TalentSection,
} from './wr-text-extract'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulaCatalog } from '../../formula/src/formulaCatalog'

export type WrFormulaRow = {
  kind: 'formula'
  formulaName: string
  title: string
  subtitle?: string
  multi?: number
  unit?: string
}

export type WrStaticRow = {
  kind: 'static'
  title: string
  subtitle?: string
  unit?: string
  variant?: string
}

export type WrFieldRow = WrFormulaRow | WrStaticRow

function catalogNames(key: string): Set<string> {
  return new Set(
    Object.keys(
      (formulaCatalog as Record<string, Record<string, unknown>>)[key] ?? {}
    )
  )
}

function resolveFormulaName(key: string, candidates: string[]): string | null {
  const names = catalogNames(key)
  for (const c of candidates) {
    if (names.has(c)) return c
  }
  return null
}

function dmgFormulaPathToCandidates(path: string): string[] {
  const normalIdx = path.match(
    /dmgFormulas\.normal(?:\s+as\s+\w+)?\)\?\.\[(\d+)\]|dmgFormulas\.normal(?:\s+as\s+\w+)?\[(\d+)\]/
  )
  if (normalIdx) return [`normal_${normalIdx[1] ?? normalIdx[2]}`]

  const skillIdx = path.match(/dmgFormulas\.skill\[(\w+)\]/)
  if (skillIdx) return [`skill_${skillIdx[1]}`]

  const parts = path.match(/dmgFormulas\.(\w+)\.(\w+)/)
  if (!parts) return []
  const [, category, field] = parts

  switch (category) {
    case 'normal':
      return [field, `normal_${field}`]
    case 'charged':
      return field === 'dmg'
        ? ['charged', `charged_${field}`]
        : [`charged_${field}`, field]
    case 'plunging':
      return [`plunging_${field}`]
    case 'skill':
      if (field === 'press') return ['skill', `skill_${field}`]
      if (field === 'dmg') return ['skill_plunging_dmg', `skill_${field}`]
      if (field === 'low') return ['skill_plunging_low', `skill_${field}`]
      if (field === 'high') return ['skill_plunging_high', `skill_${field}`]
      return [`skill_${field}`]
    case 'burst':
      if (field === 'dmg') return ['burst', `burst_${field}`]
      if (field === 'skillDmg') return ['burst_skillDmg', 'burst']
      return [`burst_${field}`]
    case 'passive1':
      return [`a1_${field}`, `p1_${field}`, `passive1_${field}`]
    case 'passive2':
      return [`a4_${field}`, `p2_${field}`, `passive2_${field}`]
    case 'constellation1':
    case 'constellation2':
    case 'constellation3':
    case 'constellation4':
    case 'constellation5':
    case 'constellation6': {
      const n = category.replace('constellation', '')
      if (field === 'dmg') return [`c${n}`, `c${n}_dmg`]
      return [`c${n}_${field}`, `${category}_${field}`]
    }
    default:
      return [`${category}_${field}`]
  }
}

function standaloneVarCandidates(varName: string): string[] {
  const aMatch = /^a([14])(.+)$/.exec(varName)
  if (aMatch) {
    const rest = aMatch[2]
    const snake = `${rest.charAt(0).toLowerCase()}${rest.slice(1)}`
    return [`a${aMatch[1]}_${snake}`, varName]
  }
  const cMatch = /^c([1-6])(.+)$/.exec(varName)
  if (cMatch) {
    const rest = cMatch[2]
    const snake = `${rest.charAt(0).toLowerCase()}${rest.slice(1)}`
    return [`c${cMatch[1]}_${snake}`, varName]
  }
  return [varName]
}

function dmPathToCandidates(dmPath: string): string[] {
  const m = dmPath.match(/dm\.(\w+)\.(\w+)/)
  if (!m) return []
  const [, area, field] = m

  const known: Record<string, Record<string, string[]>> = {
    skill: {
      cd: ['skill_cd'],
      duration: ['skill_duration'],
      bladeInterval: ['skill_bladeInterval'],
    },
    burst: {
      cd: ['burst_cd'],
      duration: ['burst_duration'],
      enerCost: ['burst_enerCost'],
    },
    charged: {
      stam: ['charged_stam'],
      stamina: ['charged_stamina'],
    },
    normal: {
      bladeThornInterval: ['bladeThornInterval'],
    },
    passive1: {
      interval: ['a1_interval', 'p1_interval'],
      duration: ['a1_duration', 'p1_duration'],
    },
    passive2: {
      duration: ['a4_duration', 'p2_duration'],
    },
    constellation6: {
      critDuration: ['c6_critDuration'],
      ousiaCd: ['c6_ousiaCd'],
      ousiaDuration: ['c6_ousiaDuration'],
    },
  }

  if (known[area]?.[field]) return known[area][field]
  return [`${area}_${field}`]
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

function hitArrCount(wrSrc: string, area: 'normal' | 'skill'): number {
  const m = wrSrc.match(
    new RegExp(`${area}:\\s*\\{[\\s\\S]*?hitArr:\\s*\\[([\\s\\S]*?)\\]`)
  )
  if (!m) return 0
  return (m[1].match(/skillParam_gen\.(?:auto|skill)\[[ab]\+\+\]/g) ?? []).length
}

const TITLE_RE =
  /(?:text|name):\s*(ct\.(?:chg|ch)\([^)]+\)|stg?\([^)]*\)|st\([^)]*\))/
const SUFFIX_RE = /textSuffix:\s*([^,}\n]+)/
const MULTI_RE = /multi:\s*(\d+)/
const UNIT_QUOTED_RE = /unit:\s*'([^']+)'/
const UNIT_ST_RE = /unit:\s*(st\('[^']+'\))/
const INFUSION_RE =
  /<ColorText color="(\w+)">\{st\('infusion\.(\w+)'\)\}<\/ColorText>/

function parseTitle(el: string, prop: 'text' | 'name' = 'text'): string | null {
  const re = new RegExp(
    String.raw`${prop}:\s*(ct\.(?:chg|ch)\([^)]+\)|stg?\([^)]*\)|st\([^)]*\))`
  )
  return el.match(re)?.[1] ?? null
}

function parseSubtitle(el: string): string | undefined {
  const idx = el.indexOf('textSuffix:')
  if (idx === -1) return undefined
  let start = idx + 'textSuffix:'.length
  while (el[start] === ' ') start++
  if (el[start] === '(') {
    let depth = 0
    for (let i = start; i < el.length; i++) {
      if (el[i] === '(') depth++
      else if (el[i] === ')') {
        depth--
        if (depth === 0) return el.slice(start, i + 1).trim()
      }
    }
    return undefined
  }
  const m = el.slice(start).match(/^([^,}\n]+)/)
  return m?.[1]?.trim()
}

function parseMulti(el: string): number | undefined {
  const m = el.match(MULTI_RE)
  return m ? Number(m[1]) : undefined
}

function parseUnit(el: string): string | undefined {
  return el.match(UNIT_QUOTED_RE)?.[1] ?? el.match(UNIT_ST_RE)?.[1]
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

  const multiRe = /multi:\s*([^,}\n]+)/
  const rows: WrFieldRow[] = []

  for (let i = 0; i < count; i++) {
    const formulaPrefix = area === 'normal' ? 'normal' : 'skill'
    const formulaName = `${formulaPrefix}_${i}`
    if (!catalogNames(key).has(formulaName)) continue

    const title = `ct.chg(\`${skillParamPrefix}.skillParams.${i}\`)`
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
      title,
      ...(multi ? { multi } : {}),
    })
  }
  return rows
}

export function parseWrFieldElement(
  el: string,
  key: string,
  section: TalentSection
): WrFieldRow | null {
  const infusion = el.match(INFUSION_RE)
  if (infusion) {
    return {
      kind: 'static',
      title: `st('infusion.${infusion[2]}')`,
      variant: infusion[1],
    }
  }

  const infoMutMatch = el.match(/node:\s*infoMut\(\s*([^,({]+)/)
  if (infoMutMatch) {
    const expr = infoMutMatch[1].trim()
    let formulaName: string | null = null
    if (expr.includes('dmgFormulas')) {
      formulaName = resolveFormulaName(key, dmgFormulaPathToCandidates(expr))
    } else {
      formulaName = resolveFormulaName(key, standaloneVarCandidates(expr))
    }
    if (!formulaName) return null

    const objStart = el.indexOf('infoMut')
    const braceStart = el.indexOf('{', objStart)
    const objBody = braceStart >= 0 ? el.slice(braceStart) : el

    const title =
      parseTitle(objBody, 'name') ??
      parseTitle(el, 'name') ??
      `ct.ch('${formulaName}')`

    return {
      kind: 'formula',
      formulaName,
      title,
      subtitle: parseSubtitle(objBody),
      multi: parseMulti(objBody),
      unit: parseUnit(objBody),
    }
  }

  const bareNode = el.match(/^\{\s*node:\s*(\w+)/)
  if (bareNode) {
    const formulaName = resolveFormulaName(
      key,
      standaloneVarCandidates(bareNode[1])
    )
    if (formulaName) {
      return {
        kind: 'formula',
        formulaName,
        title: `ct.ch('${formulaName}')`,
      }
    }
    return null
  }

  const title = parseTitle(el, 'text')
  if (!title) return null

  const valueMatch = el.match(/value:\s*(dm\.[\w.]+)/)
  if (valueMatch) {
    const formulaName = resolveFormulaName(
      key,
      dmPathToCandidates(valueMatch[1])
    )
    if (formulaName) {
      return {
        kind: 'formula',
        formulaName,
        title,
        subtitle: parseSubtitle(el),
        unit: parseUnit(el),
      }
    }
  }

  return {
    kind: 'static',
    title,
    subtitle: parseSubtitle(el),
    unit: parseUnit(el),
  }
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

function findTalentSectionContent(
  wrSrc: string,
  section: TalentSection
): string | null {
  const needle = `${section}: ct.talentTem('${section}', [`
  const idx = wrSrc.indexOf(needle)
  if (idx === -1) return null
  const openBracket = idx + needle.length - 1
  let depth = 0
  for (let i = openBracket; i < wrSrc.length; i++) {
    const ch = wrSrc[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) return wrSrc.slice(openBracket + 1, i)
    }
  }
  return null
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

/** WR field rows per section (multiple groups for auto subsections). */
export function extractWrFieldRows(
  key: string
): Map<TalentSection, WrFieldRow[][]> {
  const result = new Map<TalentSection, WrFieldRow[][]>()
  for (const section of TALENT_SECTIONS) result.set(section, [])

  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return result

  for (const section of TALENT_SECTIONS) {
    const content = findTalentSectionContent(wrSrc, section)
    if (!content) continue

    const groups: WrFieldRow[][] = []
    for (const el of splitTopLevelElements(content)) {
      if (!el.startsWith('{')) continue
      const inner = extractFieldsArrayInner(el)
      if (inner === null) continue
      const rows = parseWrFieldsBlockInner(inner, key, wrSrc, section)
      if (rows.length) groups.push(rows)
    }
    result.set(section, groups)
  }

  return result
}
