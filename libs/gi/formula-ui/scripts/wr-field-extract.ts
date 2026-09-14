import {
  readWrSheetSource,
  TALENT_SECTIONS,
  type TalentSection,
} from './wr-text-extract'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulaCatalog } from '../../formula/src/formulaCatalog'

export type WrFieldGroup = {
  section: TalentSection
  /** Ordered formula catalog names; skips unmappable WR rows */
  formulaNames: string[]
}

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
  const indexMatch = path.match(
    /dmgFormulas\.normal(?:\s+as\s+\w+)?\)\?\.\[(\d+)\]|dmgFormulas\.normal(?:\s+as\s+\w+)?\[(\d+)\]/
  )
  if (indexMatch) {
    const i = indexMatch[1] ?? indexMatch[2]
    return [`normal_${i}`]
  }

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
      return field === 'press' ? ['skill', `skill_${field}`] : [`skill_${field}`]
    case 'burst':
      return field === 'dmg' ? ['burst', `burst_${field}`] : [`burst_${field}`]
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
  }

  if (known[area]?.[field]) return known[area][field]
  return [`${area}_${field}`, `${area}${field.charAt(0).toUpperCase()}${field.slice(1)}`]
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

function normalHitCount(wrSrc: string): number {
  const m = wrSrc.match(/normal:\s*\{[\s\S]*?hitArr:\s*\[([\s\S]*?)\]/)
  if (!m) return 0
  const body = m[1]
  return (body.match(/skillParam_gen\.auto\[a\+\+\]/g) ?? []).length
}

function parseWrFieldElement(
  el: string,
  key: string,
  wrSrc: string
): string | null {
  if (/\bnode\s*:/.test(el) && /\.map\s*\(/.test(el)) {
    const count = normalHitCount(wrSrc)
    return null
  }

  const infoMutMatch = el.match(/node:\s*infoMut\(\s*([^,({]+)/)
  if (infoMutMatch) {
    const expr = infoMutMatch[1].trim()
    if (expr.includes('dmgFormulas')) {
      return resolveFormulaName(key, dmgFormulaPathToCandidates(expr))
    }
    return resolveFormulaName(key, standaloneVarCandidates(expr))
  }

  const bareNode = el.match(/^\{\s*node:\s*(\w+)/)
  if (bareNode) {
    return resolveFormulaName(key, standaloneVarCandidates(bareNode[1]))
  }

  const valueMatch = el.match(/value:\s*(dm\.[\w.]+)/)
  if (valueMatch) {
    return resolveFormulaName(key, dmPathToCandidates(valueMatch[1]))
  }

  return null
}

function parseWrFieldsBlockInner(
  inner: string,
  key: string,
  wrSrc: string
): string[] {
  if (/\.map\s*\(\s*\([^)]*\)\s*=>\s*\(\{/.test(inner)) {
    const count = normalHitCount(wrSrc)
    return Array.from({ length: count }, (_, i) => `normal_${i}`).filter((n) =>
      catalogNames(key).has(n)
    )
  }

  const names: string[] = []
  for (const el of splitTopLevelElements(inner)) {
    const name = parseWrFieldElement(el, key, wrSrc)
    if (name) names.push(name)
  }
  return names
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

function extractSectionFieldGroups(
  sectionContent: string,
  key: string,
  wrSrc: string
): string[][] {
  const groups: string[][] = []

  for (const el of splitTopLevelElements(sectionContent)) {
    if (!el.startsWith('{')) continue
    const inner = extractFieldsArrayInner(el)
    if (inner === null) continue
    const names = parseWrFieldsBlockInner(inner, key, wrSrc)
    if (names.length) groups.push(names)
  }

  return groups
}

/** WR field row order per section (multiple groups for auto subsections). */
export function extractWrFieldLayout(key: string): Map<TalentSection, string[][]> {
  const result = new Map<TalentSection, string[][]>()
  for (const section of TALENT_SECTIONS) result.set(section, [])

  const wrSrc = readWrSheetSource(key)
  if (!wrSrc) return result

  for (const section of TALENT_SECTIONS) {
    const content = findTalentSectionContent(wrSrc, section)
    if (!content) continue
    result.set(section, extractSectionFieldGroups(content, key, wrSrc))
  }

  return result
}
