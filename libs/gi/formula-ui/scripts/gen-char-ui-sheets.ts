/**
 * Bulk-generate minimal char UISheets from formulaCatalog + conditionals.
 * WR skillParam titles are approximated; audit gate is charUiSheets.test.ts.
 */
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulaCatalog } from '../../formula/src/formulaCatalog'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulas } from '../../formula/src/meta'
import { extractWrCondLayout } from './wr-conditional-extract'
import { extractWrTextDocs } from './wr-text-extract'

type CatalogEntry = {
  name: string
  category?: string
  dims: Record<string, unknown>
}

const sheetsDir = join(process.cwd(), 'libs/gi/formula-ui/src/char/sheets')
const formulaCharDir = join(process.cwd(), 'libs/gi/formula/src/data/char')

const ALL_SECTIONS = [
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
type TalentSheetElementKey = (typeof ALL_SECTIONS)[number]

const existing = new Set(
  readdirSync(sheetsDir)
    .filter((f: string) => f.endsWith('.tsx'))
    .map((f: string) => f.replace(/\.tsx$/, ''))
)

const allFormulaKeys = readdirSync(formulaCharDir)
  .filter((f: string) => f.endsWith('.ts') && f !== 'util.ts')
  .map((f: string) => f.replace(/\.ts$/, ''))
  .filter((k: string) => k !== 'index')

const missing = allFormulaKeys.filter((k: string) => !existing.has(k)).sort()

function isParamOnlyEntry(entry: CatalogEntry): boolean {
  const dims = Object.keys(entry.dims)
  return dims.length > 0 && dims.every((dim) => dim === 'param')
}

function categoryFromName(name: string): TalentSheetElementKey | undefined {
  if (
    name.startsWith('normal_') ||
    name.startsWith('charged_') ||
    name.startsWith('plunging_')
  )
    return 'auto'
  if (name === 'skill' || name.startsWith('skill_')) return 'skill'
  if (name === 'burst' || name.startsWith('burst_')) return 'burst'
  const cons = /^c([1-6])(?:_|$)/.exec(name)
  if (cons) return `constellation${cons[1]}` as TalentSheetElementKey
  if (name.startsWith('a1_') || name.startsWith('p1_')) return 'passive1'
  if (name.startsWith('a4_') || name.startsWith('p2_')) return 'passive2'
  if (name.startsWith('p3_')) return 'passive3'
  return undefined
}

function entryCategory(entry: CatalogEntry): TalentSheetElementKey | 'other' {
  const cat = entry.category ?? categoryFromName(entry.name)
  if (cat && (ALL_SECTIONS as readonly string[]).includes(cat))
    return cat as TalentSheetElementKey
  const cons = /^c([1-6])$/.exec(entry.name)
  if (cons) return `constellation${cons[1]}` as TalentSheetElementKey
  return 'other'
}

function paramUnit(name: string): string | undefined {
  const lower = name.toLowerCase()
  if (lower.endsWith('_cd') || lower.includes('interval')) return 's'
  if (lower.includes('duration')) return 's'
  if (lower.endsWith('_stam') || lower.endsWith('_stamina')) {
    return lower.includes('charged') ? '/s' : undefined
  }
  return undefined
}

function paramTitleExpr(name: string): string {
  const lower = name.toLowerCase()
  if (name === 'plunging_dmg') return "stg('plunging.dmg')"
  if (name === 'plunging_low') return "stg('plunging.low')"
  if (name === 'plunging_high') return "stg('plunging.high')"
  if (lower.endsWith('_cd')) return "stg('cd')"
  if (lower.endsWith('_enercost')) return "stg('energyCost')"
  if (lower.includes('duration')) return "stg('duration')"
  if (lower.includes('heal') && !lower.includes('dmg')) return "stg('healing')"
  return `ct.ch('${name}')`
}

function fieldLine(entry: CatalogEntry, titleExpr: string): string {
  const unit = paramUnit(entry.name)
  const unitPart = unit ? `, unit: '${unit}'` : ''
  return `        {
          title: ${titleExpr},
          fieldRef: formula.${entry.name}.tag${unitPart},
        }`
}

function groupEntries(key: string) {
  const catalog =
    (formulaCatalog as Record<string, Record<string, CatalogEntry>>)[key] ?? {}
  const groups = new Map<TalentSheetElementKey | 'other', CatalogEntry[]>()
  for (const entry of Object.values(catalog)) {
    const cat = entryCategory(entry)
    const list = groups.get(cat) ?? []
    list.push(entry)
    groups.set(cat, list)
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  return groups
}

function autoSection(key: string, entries: CatalogEntry[]): string {
  const normals = entries
    .filter((e) => /^normal_\d+$/.test(e.name))
    .sort((a, b) => Number(a.name.split('_')[1]) - Number(b.name.split('_')[1]))
  const charged = entries.filter(
    (e) =>
      e.name.startsWith('charged') &&
      !isParamOnlyEntry(e) &&
      e.name !== 'charged_stam' &&
      e.name !== 'charged_stamina'
  )
  const chargedParams = entries.filter(
    (e) =>
      isParamOnlyEntry(e) &&
      (e.name.startsWith('charged') || e.name.includes('stam'))
  )
  const plunging = entries.filter((e) => e.name.startsWith('plunging_'))

  const docs: string[] = []

  if (normals.length) {
    docs.push(`    {
      type: 'text',
      text: ct.chg('auto.fields.normal'),
    },
    {
      type: 'fields',
      fields: [
        ${normals.map((e) => `formula.${e.name}`).join(',\n        ')},
      ].map(({ tag }, i) => ({
        title: ct.chg(\`auto.skillParams.\${i}\`),
        fieldRef: tag,
      })),
    }`)
  }

  if (charged.length || chargedParams.length) {
    const chargedFields = [
      ...charged.map((e, i) =>
        fieldLine(e, `ct.chg('auto.skillParams.${normals.length + i}')`)
      ),
      ...chargedParams.map((e) => fieldLine(e, paramTitleExpr(e.name))),
    ]
    docs.push(`    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
    {
      type: 'fields',
      fields: [
${chargedFields.join(',\n')}
      ],
    }`)
  }

  const usedNames = new Set(
    [...normals, ...charged, ...chargedParams, ...plunging].map((e) => e.name)
  )
  const miscAuto = entries.filter((e) => !usedNames.has(e.name))
  if (miscAuto.length) {
    const extraHeaders = (extractWrTextDocs(key).get('auto') ?? [])
      .map((d) => d.expr)
      .filter((expr) => expr.startsWith("ct.chg('auto.fields."))
    const headerExpr = extraHeaders[0] ?? "ct.chg('auto.fields.arkhe')"
    docs.push(`    {
      type: 'text',
      text: ${headerExpr},
    },
    {
      type: 'fields',
      fields: [
${miscAuto.map((e, i) => fieldLine(e, `ct.chg('auto.skillParams.${normals.length + charged.length + chargedParams.length + i}')`)).join(',\n')}
      ],
    }`)
  }

  if (plunging.length) {
    docs.push(`    {
      type: 'text',
      text: ct.chg('auto.fields.plunging'),
    },
    {
      type: 'fields',
      fields: [
${plunging.map((e) => fieldLine(e, paramTitleExpr(e.name))).join(',\n')}
      ],
    }`)
  }

  if (!docs.length) return '[]'
  return `[\n${docs.join(',\n')},\n  ]`
}

function fieldsSection(
  section: TalentSheetElementKey,
  entries: CatalogEntry[]
): string {
  if (!entries.length) return '[]'
  let paramIdx = 0
  const fields = entries.map((e) => {
    const title = isParamOnlyEntry(e)
      ? paramTitleExpr(e.name)
      : `ct.chg('${section}.skillParams.${paramIdx++}')`
    return fieldLine(e, title)
  })
  return `[
    {
      type: 'fields',
      fields: [
${fields.join(',\n')}
      ],
    }
  ]`
}

function sectionInner(section: string): string {
  if (section === '[]') return ''
  const start = section.indexOf('[')
  const end = section.lastIndexOf(']')
  return section
    .slice(start + 1, end)
    .trim()
    .replace(/,\s*$/, '')
}

function mergeSectionDocs(...parts: string[]): string {
  const inner = parts.map((p) => p.trim()).filter(Boolean)
  if (!inner.length) return '[]'
  return `[\n${inner.join(',\n')}\n  ]`
}
function conditionalDocsForSection(
  key: string,
  section: TalentSheetElementKey
): string {
  return extractWrCondLayout(key)
    .filter((p) => p.section === section)
    .map(({ condName, teamBuff }) =>
      teamBuff
        ? `    charConditionalDocument(key, cond.${condName}, { teamBuff: true }),`
        : `    charConditionalDocument(key, cond.${condName}),`
    )
    .join('\n')
}

function generateSheet(key: string): string {
  if (!(formulas as Record<string, unknown>)[key])
    throw new Error(`No formulas export for ${key}`)

  const groups = groupEntries(key)
  const autoEntries = groups.get('auto') ?? []
  const skillEntries = [
    ...(groups.get('skill') ?? []),
    ...(groups.get('other') ?? []),
  ]
  const burstEntries = groups.get('burst') ?? []
  const skillFields = sectionInner(fieldsSection('skill', skillEntries))
  const skillBody = mergeSectionDocs(
    skillFields,
    conditionalDocsForSection(key, 'skill')
  )

  const sectionLines = ALL_SECTIONS.map((section) => {
    if (section === 'auto') {
      const autoBody = mergeSectionDocs(
        sectionInner(autoSection(key, autoEntries)),
        conditionalDocsForSection(key, 'auto')
      )
      return `  auto: ct.talentTem('auto', ${autoBody}),`
    }
    if (section === 'skill') {
      return `  skill: ct.talentTem('skill', ${skillBody}),`
    }
    if (section === 'burst') {
      const burstBody = mergeSectionDocs(
        sectionInner(fieldsSection('burst', burstEntries)),
        conditionalDocsForSection(key, 'burst')
      )
      return `  burst: ct.talentTem('burst', ${burstBody}),`
    }
    const consEntries = groups.get(section) ?? []
    const sectionBody = mergeSectionDocs(
      sectionInner(fieldsSection(section, consEntries)),
      conditionalDocsForSection(key, section)
    )
    if (sectionBody !== '[]') {
      return `  ${section}: ct.talentTem('${section}', ${sectionBody}),`
    }
    const condOnly = conditionalDocsForSection(key, section)
    if (condOnly) {
      return `  ${section}: ct.talentTem('${section}', [\n${condOnly}\n  ]),`
    }
    return `  ${section}: ct.talentTem('${section}'),`
  })

  return `import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { conditionals, formulas } from '@genshin-optimizer/gi/formula'
import { st, stg } from '../../util'
import { charConditionalDocument } from '../charUiSheets'
import type { TalentSheetElementKey } from '../consts'
import { charTemplates } from '../util'

const key: CharacterKey = '${key}'
const ct = charTemplates(key)
const formula = formulas.${key}
const cond = conditionals.${key}

const sheet: UISheet<TalentSheetElementKey> = {
${sectionLines.join('\n')}
}

export default sheet
`
}

let written = 0
for (const key of missing) {
  const outPath = join(sheetsDir, `${key}.tsx`)
  writeFileSync(outPath, generateSheet(key))
  written++
  console.log(`Wrote ${key}.tsx`)
}

console.log(`Generated ${written} sheets (${missing.length} missing keys)`)
