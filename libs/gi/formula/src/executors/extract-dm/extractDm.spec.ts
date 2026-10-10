import { readFileSync } from 'node:fs'
import { workspaceRoot } from '@nx/devkit'
import { findWrCharSheet } from '../sheetScan'
import { extractWrDmBlock, hasStubDm, injectDmBlock } from './extractDm'

const STUB = `import type { CharacterKey } from '@genshin-optimizer/gi/consts'
const key: CharacterKey = 'Zhongli'
const skillParam_gen = allStats.char.skillParam[key]

// TODO: Fill data-mine values here
const _dm = {
  normal: {
    dmg1: skillParam_gen.auto[0],
  },
  charged: {},
  plunging: {},
  skill: {},
  burst: {},
} as const

export default register(
  info.key,
  dmg('normal1', info, 'atk', _dm.normal.dmg1, 'normal')
)
`

describe('extractWrDmBlock', () => {
  test('pulls Nahida counters + karma indices from WR', () => {
    const wrPath = findWrCharSheet(workspaceRoot, 'Nahida')
    expect(wrPath).toBeTruthy()
    const block = extractWrDmBlock(readFileSync(wrPath!, 'utf8'))
    expect(block).toBeTruthy()
    expect(block).toMatch(/let a = 0/)
    expect(block).toContain('karmaAtkDmg')
    expect(block).toContain('skillParam_gen.skill[s++]')
    expect(block).toMatch(/as const/)
  })

  test('pulls HuTao extra p1/p2 counters', () => {
    const wrPath = findWrCharSheet(workspaceRoot, 'HuTao')
    const block = extractWrDmBlock(readFileSync(wrPath!, 'utf8'))
    expect(block).toMatch(/p1 = 0/)
    expect(block).toContain('atkInc')
  })
})

describe('injectDmBlock', () => {
  test('replaces stub _dm and comments the dummy dmg line', () => {
    const wrPath = findWrCharSheet(workspaceRoot, 'Nahida')
    const wrDm = extractWrDmBlock(readFileSync(wrPath!, 'utf8'))!
    expect(hasStubDm(STUB)).toBe(true)
    const { src, action } = injectDmBlock(STUB, wrDm)
    expect(action).toBe('injected')
    expect(src).toContain('const dm =')
    expect(src).not.toMatch(/const _dm/)
    expect(src).toContain('karmaAtkDmg')
    expect(src).toMatch(/dmg\(\) stub removed by extract-dm/)
    expect(src).not.toMatch(/^\s*dmg\('normal1'/m)
  })

  test('skips already-ported dm unless force', () => {
    const ported = 'const dm = {\n  skill: {}\n} as const\n'
    const { action } = injectDmBlock(ported, 'const dm = { x: 1 }')
    expect(action).toBe('skipped')
    const forced = injectDmBlock(ported, 'const dm = { x: 1 }', true)
    expect(forced.action).toBe('replaced')
    expect(forced.src).toContain('{ x: 1 }')
  })
})
