import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { data, keys, values } from '..'
import {
  charTagMapNodeEntries,
  conditionals,
  discTagMapNodeEntries,
  teamData,
  withMember,
} from '../..'
import { Calculator } from '../../calculator'
import {
  conditionalEntries,
  convert,
  enemy,
  enemyDebuff,
  own,
  ownTag,
  type TagMapNodeEntries,
} from '../util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))

function testCharacterData(setKey: DiscSetKey) {
  const data: TagMapNodeEntries = [
    ...teamData(['Anby']),
    ...withMember(
      'Anby',
      ...charTagMapNodeEntries({
        level: 60,
        promotion: 5,
        key: 'Anby',
        mindscape: 0,
        basic: 0,
        dodge: 0,
        special: 0,
        assist: 0,
        chain: 0,
        core: 6,
      }),
      ...discTagMapNodeEntries(
        {},
        {
          [setKey]: 4,
        }
      )
    ),
    own.common.critMode.add('avg'),
    enemy.common.def.add(953),
    enemy.common.res_.electric.add(0.1),
    enemy.common.isStunned.add(0),
    enemyDebuff.common.resRed_.electric.add(0.15),
    enemyDebuff.common.dmgInc_.add(0.1),
    enemyDebuff.common.dmgRed_.add(0.15),
    enemyDebuff.common.stun_.add(1.5),
  ]
  return data
}

describe('Disc sheets test', () => {
  it('AstrolVoice 4p', () => {
    const data = testCharacterData('AstralVoice')
    data.push(
      conditionalEntries(
        'AstralVoice',
        'Anby',
        'Anby'
      )(conditionals.AstralVoice.astral.name, 3)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    // console.log(
    //   JSON.stringify(calc.toDebug().compute(anby.final.dmg_), undefined, 2)
    // )
    expect(calc.compute(anby.final.dmg_).val).toBeCloseTo(0.24)
  })
})
