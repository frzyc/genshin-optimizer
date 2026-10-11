/**
 * Forward-looking UI sheet generator for new formula content.
 *
 * Characters: emit `src/char/sheets/<Key>.tsx` (WR-first, catalog fallback).
 * Art / weapons: runtime UI in artUiSheets.tsx / weaponUiSheets.tsx — no files to emit.
 */
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
// biome-ignore lint/style/noRestrictedImports: codegen reads formula source directly
import { conditionals, formulas } from '../../formula/src/meta'
import {
  charSheetExists,
  charSheetPath,
  listMissingCharSheetKeys,
} from './lib/char-keys'
import { buildCoverageReport, printCoverageReport } from './lib/coverage'
import {
  describeCharSheetSources,
  generateCharUiSheetSource,
} from './lib/render-char-sheet'

type Kind = 'char' | 'art' | 'weapon'

function parseArgs(argv: string[]) {
  let kind: Kind = 'char'
  const keys: string[] = []
  let allMissing = false
  let check = false
  let force = false
  let index = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--kind' || arg.startsWith('--kind=')) {
      const value = arg.includes('=') ? arg.split('=')[1] : argv[++i]
      if (value !== 'char' && value !== 'art' && value !== 'weapon') {
        throw new Error(`Invalid --kind ${value}`)
      }
      kind = value
    } else if (arg === '--key' || arg.startsWith('--key=')) {
      const value = arg.includes('=') ? arg.split('=')[1] : argv[++i]
      keys.push(
        ...value
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      )
    } else if (arg === '--all-missing') {
      allMissing = true
    } else if (arg === '--check') {
      check = true
    } else if (arg === '--force') {
      force = true
    } else if (arg === '--index') {
      index = true
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return { kind, keys, allMissing, check, force, index }
}

function printHelp() {
  console.log(`Usage: gen-ui-sheets [options]

Generate Pando UI sheets for new formula content.

Options:
  --kind=char|art|weapon   Target content (default: char)
  --key=<Key>[,<Key>...]   One or more sheet keys
  --all-missing            All formula chars without a .tsx sheet
  --check                  Report only; do not write files
  --force                  Overwrite existing char sheets
  --index                  Run gen-char-ui-index after char writes

Examples:
  yarn nx run gi-formula-ui:gen-ui-sheets -- --kind=char --key=NewChar --index
  yarn nx run gi-formula-ui:gen-ui-sheets -- --all-missing --check
  yarn nx run gi-formula-ui:check-ui-coverage
`)
}

function resolveCharKeys(keys: string[], allMissing: boolean): string[] {
  if (allMissing) return listMissingCharSheetKeys()
  if (keys.length) return keys
  throw new Error('Provide --key=<Key> or --all-missing for --kind=char')
}

function runIndex() {
  execSync('yarn nx run gi-formula-ui:gen-char-ui-index', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}

function generateChar(
  keys: string[],
  check: boolean,
  force: boolean,
  index: boolean
) {
  let written = 0
  let skipped = 0

  for (const key of keys) {
    if (!(formulas as Record<string, unknown>)[key]) {
      console.error(`Skip ${key}: no formulas export`)
      skipped++
      continue
    }

    const exists = charSheetExists(key)
    if (exists && !force) {
      console.log(`Skip ${key}: sheet exists (use --force to overwrite)`)
      skipped++
      continue
    }

    const meta = describeCharSheetSources(key)
    const wrNote = meta.hasWr
      ? `WR ${meta.wrSections}/12 sections, ${meta.condCount} conds`
      : `catalog fallback, ${meta.condCount} conds`

    if (check) {
      console.log(`Would write ${key}.tsx (${wrNote})`)
      continue
    }

    const source = generateCharUiSheetSource(key)
    writeFileSync(charSheetPath(key), source)
    console.log(`Wrote ${key}.tsx (${wrNote})`)
    written++
  }

  if (check) {
    console.log(
      `Check: ${keys.length - skipped} char sheet(s) would be written, ${skipped} skipped`
    )
    return
  }

  console.log(`Generated ${written} char sheet(s), skipped ${skipped}`)
  if (written && index) runIndex()
}

function reportArtWeapon(
  kind: 'art' | 'weapon',
  key: string | undefined,
  check: boolean
) {
  const report = buildCoverageReport()
  const section = kind === 'art' ? report.art : report.weapon

  if (key) {
    const count = Object.keys(
      (conditionals as Record<string, Record<string, unknown>>)[key] ?? {}
    ).length
    console.log(
      `${kind} UI for ${key}: runtime-generated (${count} conditional${count === 1 ? '' : 's'})`
    )
    if (!check) {
      console.log(
        'No file emission needed — conditionals appear automatically in artUiSheets / weaponUiSheets.'
      )
    }
    return
  }

  console.log(`${kind} UI is runtime-generated for all const keys.`)
  console.log(
    `Formula ${kind}s: ${section.formulaCount}, with conditionals: ${section.withConditionals}`
  )
  if (section.missingFromConsts.length) {
    console.log(
      `Keys missing from consts: ${section.missingFromConsts.join(', ')}`
    )
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.kind === 'char') {
    const keys = resolveCharKeys(args.keys, args.allMissing)
    if (!keys.length) {
      console.log('No missing char sheets.')
      if (args.check) printCoverageReport(buildCoverageReport())
      return
    }
    generateChar(keys, args.check, args.force, args.index)
    return
  }

  const key = args.keys[0]
  if (args.keys.length > 1) {
    throw new Error(`Only one --key supported for --kind=${args.kind}`)
  }
  reportArtWeapon(args.kind, key, args.check)
}

main()
