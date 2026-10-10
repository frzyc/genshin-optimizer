// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { formulas } from '../../../formula/src/meta'
import { extractWrTextDocs, textDocLine } from '../wr-text-extract'
import {
  formulaConditionalNames,
  renderCatalogFallbackSection,
} from './catalog-fallback'
import {
  extractWrCondRenderInfo,
  type WrCondRender,
} from './extract-wr-cond-fields'
import {
  extractWrSectionDocs,
  hasWrSheet,
  type WrSectionDoc,
} from './extract-wr-section-docs'
import { TALENT_SECTIONS, type TalentSection } from './paths'
import {
  renderFieldRow,
  renderFieldsBlock,
  sheetUsesStImport,
} from './render-field'

function renderSectionDoc(doc: WrSectionDoc): string {
  if (doc.kind === 'text') return textDocLine(doc.expr)
  return renderFieldsBlock(doc.rows)
}

function renderConditional(cond: WrCondRender): string {
  const opts: string[] = []
  if (cond.teamBuff) opts.push('teamBuff: true')
  if (cond.label) opts.push(`label: ${cond.label}`)
  if (cond.fields?.length) {
    opts.push(
      `fields: [\n${cond.fields.map((row) => renderFieldRow(row).replace(/^ {8}/gm, '          ')).join(',\n')},\n      ]`
    )
  }
  if (!opts.length) {
    return `    charConditionalDocument(key, cond.${cond.condName}),`
  }
  return `    charConditionalDocument(key, cond.${cond.condName}, { ${opts.join(', ')} }),`
}

function mergeTextDocs(
  section: TalentSection,
  body: string,
  key: string
): string {
  const extraTexts = (extractWrTextDocs(key).get(section) ?? [])
    .map((d) => d.expr)
    .filter((expr) => !body.includes(expr))

  if (!extraTexts.length) return body
  const extras = extraTexts.map(textDocLine).join(',\n')
  if (!body.trim()) return extras
  return `${body},\n${extras}`
}

function renderSectionBody(key: string, section: TalentSection): string {
  const wrDocs = extractWrSectionDocs(key, section)
  const conds = extractWrCondRenderInfo(key).filter(
    (c) => c.section === section
  )

  const parts: string[] = []
  if (wrDocs.length) {
    parts.push(...wrDocs.map(renderSectionDoc))
  } else {
    const fallback = renderCatalogFallbackSection(key, section)
    if (fallback) parts.push(fallback)
  }

  for (const cond of conds) {
    parts.push(renderConditional(cond))
  }

  // Formula conditionals without WR condTem (e.g. simple bool c1/c2)
  const wrCondNames = new Set(conds.map((c) => c.condName))
  for (const name of formulaConditionalNames(key)) {
    if (wrCondNames.has(name)) continue
    if (parts.some((p) => p.includes(`cond.${name}`))) continue
    parts.push(`    charConditionalDocument(key, cond.${name}),`)
  }

  let body = parts.filter(Boolean).join(',\n')
  body = mergeTextDocs(section, body, key)
  return body
}

export function generateCharUiSheetSource(key: string): string {
  if (!(formulas as Record<string, unknown>)[key]) {
    throw new Error(`No formulas export for ${key}`)
  }

  const sectionLines = TALENT_SECTIONS.map((section) => {
    const body = renderSectionBody(key, section)
    if (!body.trim()) {
      return `  ${section}: ct.talentTem('${section}'),`
    }
    return `  ${section}: ct.talentTem('${section}', [\n${body}\n  ]),`
  })

  const sheetSource = `import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
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

  if (!sheetUsesStImport(sheetSource)) {
    return sheetSource.replace(
      "import { st, stg } from '../../util'",
      "import { stg } from '../../util'"
    )
  }
  return sheetSource
}

export function describeCharSheetSources(key: string): {
  hasWr: boolean
  wrSections: number
  condCount: number
} {
  const hasWr = hasWrSheet(key)
  const wrSections = TALENT_SECTIONS.filter(
    (s) => extractWrSectionDocs(key, s).length > 0
  ).length
  return {
    hasWr,
    wrSections,
    condCount: formulaConditionalNames(key).length,
  }
}
