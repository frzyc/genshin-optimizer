import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as path from 'node:path'
import { formatText } from '@genshin-optimizer/common/pipeline'
import { workspaceRoot } from '@nx/devkit'
import {
  classifyPandoSheet,
  expectedKeys,
  listPandoKeys,
  pandoSheetPath,
  type SheetKind,
  type SheetScan,
  scanEntity,
} from '../sheetScan'

export type AuditSummary = {
  kind: SheetKind
  total: number
  ported: number
  stub: number
  placeholder: number
  missing: number
}

export type AuditReport = {
  generatedAt: string
  summary: AuditSummary[]
  entities: SheetScan[]
}

export function priority(scan: SheetScan): number {
  let n = 0
  if (scan.status === 'missing') n += 200
  if (scan.status === 'placeholder') n += 80
  if (scan.status === 'stub') n += 20
  if (scan.flags.includes('splitScaleDmgNode')) n += 50
  if (scan.flags.includes('infusion')) n += 50
  if (scan.flags.includes('dataOverlay')) n += 40
  if (scan.flags.includes('lookup')) n += 15
  if (scan.key.startsWith('Traveler')) n += 25
  n += scan.wrConds.length
  return n
}

export function runAudit(root = workspaceRoot): AuditReport {
  const kinds: SheetKind[] = ['char', 'weapon', 'artifact']
  const entities: SheetScan[] = []
  for (const kind of kinds) {
    const keys = new Set([...expectedKeys(kind), ...listPandoKeys(root, kind)])
    for (const key of [...keys].sort()) {
      entities.push(scanEntity(root, kind, key))
    }
  }
  entities.sort(
    (a, b) => priority(b) - priority(a) || a.key.localeCompare(b.key)
  )

  const summary: AuditSummary[] = kinds.map((kind) => {
    const rows = entities.filter((e) => e.kind === kind)
    return {
      kind,
      total: rows.length,
      ported: rows.filter((e) => e.status === 'ported').length,
      stub: rows.filter((e) => e.status === 'stub').length,
      placeholder: rows.filter((e) => e.status === 'placeholder').length,
      missing: rows.filter((e) => e.status === 'missing').length,
    }
  })

  return {
    generatedAt: new Date().toISOString(),
    summary,
    entities,
  }
}

export function toCsv(report: AuditReport): string {
  const header = [
    'kind',
    'key',
    'status',
    'priority',
    'flags',
    'wrCondCount',
    'pandoCondCount',
    'wrListingHints',
    'pandoListingCount',
  ]
  const lines = [header.join(',')]
  for (const e of report.entities) {
    lines.push(
      [
        e.kind,
        e.key,
        e.status,
        String(priority(e)),
        `"${e.flags.join('|')}"`,
        String(e.wrConds.length),
        String(e.pandoConds.length),
        String(e.wrListingHints),
        String(e.pandoListings.length),
      ].join(',')
    )
  }
  return lines.join('\n')
}

export function artifactStubSource(key: string): string {
  return `import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { registerArt } from './util'

const key: ArtifactSetKey = '${key}'
// TODO: Conditionals
export default registerArt(
  key
  // 2pc/4pc: artCount(key) + cmpGE. See NoblesseOblige.ts.
  // Never ship placeholder 2pc/4pc ATK buffs.
)
`
}

export function isPoisonArtifactStub(src: string): boolean {
  return classifyPandoSheet('artifact', src).status === 'placeholder'
}

export async function stripArtifactPlaceholders(
  root = workspaceRoot
): Promise<{ key: string; path: string }[]> {
  const written: { key: string; path: string }[] = []
  for (const key of expectedKeys('artifact')) {
    const filePath = pandoSheetPath(root, 'artifact', key)
    if (!existsSync(filePath)) continue
    const src = readFileSync(filePath, 'utf8')
    if (!isPoisonArtifactStub(src)) continue
    const formatted = await formatText(filePath, artifactStubSource(key))
    writeFileSync(filePath, formatted)
    written.push({ key, path: filePath })
  }
  return written
}

export function writeReport(
  report: AuditReport,
  outputPath: string,
  format: 'json' | 'csv'
): void {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  const body =
    format === 'csv' ? toCsv(report) : JSON.stringify(report, null, 2)
  writeFileSync(outputPath, body)
}
