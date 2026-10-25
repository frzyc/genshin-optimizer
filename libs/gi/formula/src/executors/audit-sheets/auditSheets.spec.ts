import {
  classifyPandoSheet,
  parsePandoCondNames,
  parseWrCondNames,
} from '../sheetScan'
import {
  artifactStubSource,
  isPoisonArtifactStub,
  priority,
} from './auditSheets'

const CHAR_STUB = `
// TODO: Fill data-mine values here
const _dm = { normal: { dmg1: skillParam_gen.auto[0] } }
ownBuff.premod.atk.add(1)
const { _someBoolConditional } = allBoolConditionals(info.key)
`

const CHAR_TODO_COMMENTS = `
// TODO: Fill data-mine values here
const _dm = { normal: { dmg1: skillParam_gen.auto[0] } }
// TODO: ownBuff.premod.atk.add(1),
// TODO: teamBuff.premod.atk.add(1),
// TODO: enemyDebuff.common.defRed_.add(1),
const { _someBoolConditional } = allBoolConditionals(info.key)
`

const CHAR_PORTED = `
const dm = { skill: { pressDmg: skillParam_gen.skill[s++] } }
const { partyInBurst } = allBoolConditionals(info.key)
const { c4Stacks } = allNumConditionals(info.key)
dmg('karma_dmg', info, 'atk', dm.skill.pressDmg, 'skill')
`

const ART_POISON = `
const { someBoolConditional } = allBoolConditionals(key)
ownBuff.premod.atk_.add(cmpGE(count, 2, percent(1))),
teamBuff.premod.atk_.addOnce(key, someBoolConditional.ifOn(cmpGE(count, 4, percent(1))))
// TODO: Conditionals
`

describe('classifyPandoSheet', () => {
  test('char stub with atk.add(1) is placeholder', () => {
    expect(classifyPandoSheet('char', CHAR_STUB).status).toBe('placeholder')
  })

  test('char stub with // TODO: atk.add(1) is stub, not placeholder', () => {
    expect(classifyPandoSheet('char', CHAR_TODO_COMMENTS).status).toBe('stub')
    expect(classifyPandoSheet('char', CHAR_TODO_COMMENTS).flags).not.toContain(
      'atk.add(1)'
    )
  })

  test('ported char has real conds and listings', () => {
    const { status } = classifyPandoSheet('char', CHAR_PORTED)
    expect(status).toBe('ported')
    expect(parsePandoCondNames(CHAR_PORTED)).toEqual([
      'c4Stacks',
      'partyInBurst',
    ])
  })

  test('artifact template poison', () => {
    expect(classifyPandoSheet('artifact', ART_POISON).status).toBe(
      'placeholder'
    )
    expect(isPoisonArtifactStub(ART_POISON)).toBe(true)
    expect(isPoisonArtifactStub(artifactStubSource('DeepwoodMemories'))).toBe(
      false
    )
  })
})

describe('parseWrCondNames', () => {
  test('reads cond(key, name)', () => {
    const src = `
      const [condAPath, condA] = cond(key, 'SweepingTime')
      const [condBPath, condB] = cond(key, "set4")
    `
    expect(parseWrCondNames(src)).toEqual(['SweepingTime', 'set4'])
  })
})

describe('priority', () => {
  test('placeholder outranks stub', () => {
    const stub = {
      kind: 'char' as const,
      key: 'A',
      status: 'stub' as const,
      flags: [],
      wrConds: [],
      pandoConds: [],
      wrListingHints: 0,
      pandoListings: [],
    }
    const poison = { ...stub, key: 'B', status: 'placeholder' as const }
    expect(priority(poison)).toBeGreaterThan(priority(stub))
  })
})
