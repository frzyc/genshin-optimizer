/**
 * Catalog grouping fallback when WR has no section layout for a character.
 */
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulaCatalog } from '../../../formula/src/formulaCatalog'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { conditionals } from '../../../formula/src/meta'
import type { WrFieldRow } from '../wr-field-row-extract'
import type { TalentSection } from './paths'
import { TALENT_SECTIONS } from './paths'
import { renderFieldsBlock } from './render-field'

type CatalogEntry = {
  name: string
  category?: string
  dims: Record<string, unknown>
}

function isParamOnlyEntry(entry: CatalogEntry): boolean {
  const dims = Object.keys(entry.dims)
  return dims.length > 0 && dims.every((dim) => dim === 'param')
}

function categoryFromName(name: string): TalentSection | undefined {
  if (
    name.startsWith('normal_') ||
    name.startsWith('charged_') ||
    name.startsWith('plunging_')
  )
    return 'auto'
  if (name === 'skill' || name.startsWith('skill_')) return 'skill'
  if (name === 'burst' || name.startsWith('burst_')) return 'burst'
  const cons = /^c([1-6])(?:_|$)/.exec(name)
  if (cons) return `constellation${cons[1]}` as TalentSection
  if (name.startsWith('a1_') || name.startsWith('p1_')) return 'passive1'
  if (name.startsWith('a4_') || name.startsWith('p2_')) return 'passive2'
  if (name.startsWith('p3_')) return 'passive3'
  return undefined
}

function entryCategory(entry: CatalogEntry): TalentSection | 'other' {
  const cat = entry.category ?? categoryFromName(entry.name)
  if (cat && (TALENT_SECTIONS as readonly string[]).includes(cat))
    return cat as TalentSection
  const cons = /^c([1-6])$/.exec(entry.name)
  if (cons) return `constellation${cons[1]}` as TalentSection
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

function catalogEntryToRow(entry: CatalogEntry, titleExpr: string): WrFieldRow {
  return {
    kind: 'formula',
    formulaName: entry.name,
    title: titleExpr,
    ...(paramUnit(entry.name) ? { unit: paramUnit(entry.name) } : {}),
  }
}

export function groupCatalogEntries(key: string) {
  const catalog =
    (formulaCatalog as Record<string, Record<string, CatalogEntry>>)[key] ?? {}
  const groups = new Map<TalentSection | 'other', CatalogEntry[]>()
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

/** Minimal catalog-only section when WR layout is absent. */
export function renderCatalogFallbackSection(
  key: string,
  section: TalentSection
): string {
  const groups = groupCatalogEntries(key)
  const entries =
    section === 'skill'
      ? [...(groups.get('skill') ?? []), ...(groups.get('other') ?? [])]
      : (groups.get(section) ?? [])

  if (section === 'auto') {
    return renderCatalogAutoSection(key, groups.get('auto') ?? [])
  }

  if (!entries.length) return ''

  let paramIdx = 0
  const rows = entries.map((entry) =>
    catalogEntryToRow(
      entry,
      isParamOnlyEntry(entry)
        ? paramTitleExpr(entry.name)
        : `ct.chg('${section}.skillParams.${paramIdx++}')`
    )
  )
  return renderFieldsBlock(rows)
}

function renderCatalogAutoSection(
  key: string,
  entries: CatalogEntry[]
): string {
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
    const rows: WrFieldRow[] = [
      ...charged.map((e, i) =>
        catalogEntryToRow(e, `ct.chg('auto.skillParams.${normals.length + i}')`)
      ),
      ...chargedParams.map((e) => catalogEntryToRow(e, paramTitleExpr(e.name))),
    ]
    docs.push(`    {
      type: 'text',
      text: ct.chg('auto.fields.charged'),
    },
${renderFieldsBlock(rows)}`)
  }

  if (plunging.length) {
    docs.push(`    {
      type: 'text',
      text: ct.chg('auto.fields.plunging'),
    },
${renderFieldsBlock(plunging.map((e) => catalogEntryToRow(e, paramTitleExpr(e.name))))}`)
  }

  return docs.join(',\n')
}

export function formulaConditionalNames(key: string): string[] {
  return Object.keys(
    (conditionals as Record<string, Record<string, unknown>>)[key] ?? {}
  )
}
