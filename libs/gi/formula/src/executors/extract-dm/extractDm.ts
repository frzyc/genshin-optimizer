import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { workspaceRoot } from '@nx/devkit'
import { findWrCharSheet, pandoSheetPath } from '../sheetScan'

export function matchBraces(src: string, openIdx: number): number {
  if (src[openIdx] !== '{') throw new Error('matchBraces: expected {')
  let depth = 0
  let quote: '"' | "'" | '`' | null = null
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i]
    const prev = src[i - 1]
    if (quote) {
      if (c === quote && prev !== '\\') quote = null
      continue
    }
    if (c === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i)
      i = nl === -1 ? src.length : nl
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      quote = c
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  throw new Error('matchBraces: unmatched {')
}

function precedingLetStart(src: string, dmIndex: number): number {
  const before = src.slice(0, dmIndex)
  const letMatch = before.match(/let(?:\s+\w+\s*=\s*0\s*,)*\s*\w+\s*=\s*0\s*$/)
  return letMatch?.index != null ? letMatch.index : dmIndex
}

export function extractWrDmBlock(src: string): string | undefined {
  const dmMatch = src.match(/\bconst\s+dm\s*=\s*/)
  if (!dmMatch || dmMatch.index == null) return undefined
  const eqEnd = dmMatch.index + dmMatch[0].length
  const openIdx = src.indexOf('{', eqEnd)
  if (openIdx === -1) return undefined
  const closeIdx = matchBraces(src, openIdx)
  let end = closeIdx + 1
  const after = src.slice(end)
  const asConst = after.match(/^\s*as\s+const/)
  if (asConst) end += asConst[0].length

  const start = precedingLetStart(src, dmMatch.index)
  return src.slice(start, end).trim()
}

const STUB_DM_RE =
  /(?:\/\/ TODO: Fill data-mine values here\r?\n)?const _dm\s*=\s*/

export function hasStubDm(pandoSrc: string): boolean {
  return STUB_DM_RE.test(pandoSrc) || pandoSrc.includes('TODO: Fill data-mine')
}

export function hasRealDm(pandoSrc: string): boolean {
  return /\bconst\s+dm\s*=/.test(pandoSrc)
}

export function injectDmBlock(
  pandoSrc: string,
  wrDmBlock: string,
  force = false
): { src: string; action: 'injected' | 'skipped' | 'replaced' } {
  if (hasRealDm(pandoSrc) && !hasStubDm(pandoSrc) && !force) {
    return { src: pandoSrc, action: 'skipped' }
  }

  const stub = pandoSrc.match(STUB_DM_RE)
  if (stub && stub.index != null) {
    const eqEnd = stub.index + stub[0].length
    const openIdx = pandoSrc.indexOf('{', eqEnd)
    if (openIdx === -1) throw new Error('injectDmBlock: stub _dm has no {')
    const closeIdx = matchBraces(pandoSrc, openIdx)
    let end = closeIdx + 1
    const after = pandoSrc.slice(end)
    const asConst = after.match(/^\s*as\s+const/)
    if (asConst) end += asConst[0].length
    let next = `${pandoSrc.slice(0, stub.index)}${wrDmBlock}${pandoSrc.slice(end)}`
    next = commentStubDmgLine(next)
    return { src: next, action: hasRealDm(pandoSrc) ? 'replaced' : 'injected' }
  }

  if (force && hasRealDm(pandoSrc)) {
    const dmMatch = pandoSrc.match(/\bconst\s+dm\s*=\s*/)
    if (!dmMatch || dmMatch.index == null)
      return { src: pandoSrc, action: 'skipped' }
    const openIdx = pandoSrc.indexOf('{', dmMatch.index + dmMatch[0].length)
    const closeIdx = matchBraces(pandoSrc, openIdx)
    const start = precedingLetStart(pandoSrc, dmMatch.index)
    let end = closeIdx + 1
    const after = pandoSrc.slice(end)
    const asConst = after.match(/^\s*as\s+const/)
    if (asConst) end += asConst[0].length
    return {
      src: `${pandoSrc.slice(0, start)}${wrDmBlock}${pandoSrc.slice(end)}`,
      action: 'replaced',
    }
  }

  return { src: pandoSrc, action: 'skipped' }
}

/** Stub `dmg('normal1', … _dm.normal.dmg1)` will not typecheck against WR hitArr. */
function commentStubDmgLine(src: string): string {
  return src.replace(
    /^(\s*)dmg\(\s*'normal1'[^)]*\)\s*,?\s*$/m,
    '$1// dmg() stub removed by extract-dm; add listings in the port step'
  )
}

export type ExtractDmResult = {
  key: string
  action: 'injected' | 'skipped' | 'replaced' | 'no-wr' | 'no-dm' | 'no-pando'
  wrPath?: string
  pandoPath?: string
}

export async function extractDmForKey(
  key: string,
  options: { force?: boolean; dryRun?: boolean; root?: string } = {}
): Promise<ExtractDmResult> {
  const root = options.root ?? workspaceRoot
  const wrPath = findWrCharSheet(root, key)
  const pandoPath = pandoSheetPath(root, 'char', key)
  if (!wrPath) return { key, action: 'no-wr', pandoPath }
  if (!existsSync(pandoPath))
    return { key, action: 'no-pando', wrPath, pandoPath }

  const wrSrc = readFileSync(wrPath, 'utf8')
  const wrDm = extractWrDmBlock(wrSrc)
  if (!wrDm) return { key, action: 'no-dm', wrPath, pandoPath }

  const pandoSrc = readFileSync(pandoPath, 'utf8')
  const { src, action } = injectDmBlock(pandoSrc, wrDm, options.force)
  if (action === 'skipped' || options.dryRun) {
    return { key, action, wrPath, pandoPath }
  }
  const formatted = await formatText(pandoPath, src)
  writeFileSync(pandoPath, formatted)
  return { key, action, wrPath, pandoPath }
}

export async function extractDmAll(
  options: { force?: boolean; dryRun?: boolean; root?: string } = {}
): Promise<ExtractDmResult[]> {
  const results: ExtractDmResult[] = []
  for (const key of allCharacterKeys) {
    results.push(await extractDmForKey(key, options))
  }
  return results
}
