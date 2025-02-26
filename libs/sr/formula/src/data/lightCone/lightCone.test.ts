import { prettify } from '@genshin-optimizer/common/util'
import {
  Calculator,
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { data, keys, values } from '..'
import { conditionals } from '../../meta'
import {
  charTagMapNodeEntries,
  lightConeTagMapNodeEntries,
  teamData,
  withMember,
} from '../../util'
import type { Read, TagMapNodeEntries } from '../util'
import { conditionalEntries, convert, enemy, own, ownTag } from '../util'

setDebugMode(true)
Object.assign(values, compileTagMapValues(keys, data))

function testCharacterData(
  setKey: LightConeKey,
  otherCharData: TagMapNodeEntries = []
) {
  const data: TagMapNodeEntries = [
    ...teamData(['Seele']),
    ...withMember(
      'Seele',
      ...charTagMapNodeEntries(
        {
          level: 80,
          ascension: 6,
          key: 'Seele',
          eidolon: 0,
          basic: 0,
          skill: 0,
          ult: 0,
          talent: 0,
          servantSkill: 0,
          servantTalent: 0,
          bonusAbilities: {},
          statBoosts: {},
        },
        1
      ),
      ...lightConeTagMapNodeEntries(setKey, 80, 6, 5),
      ...otherCharData
    ),
    own.common.critMode.add('avg'),
    enemy.common.res.quantum.add(0.1),
    enemy.common.isBroken.add(0),
  ]
  return data
}

function cond(setKey: LightConeKey, name: string, value: number) {
  return conditionalEntries(setKey, 'Seele', null)(name, value)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}

describe('Light Cone sheets test', () => {
  it('Adversarial', () => {
    const data = testCharacterData('Adversarial')
    data.push(
      cond('Adversarial', conditionals.Adversarial.enemyDefeated.name, 1)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.spd_).val).toBeCloseTo(0.18)
  })

  it('AfterTheCharmonyFall', () => {
    const data = testCharacterData('AfterTheCharmonyFall')
    data.push(
      cond(
        'AfterTheCharmonyFall',
        conditionals.AfterTheCharmonyFall.ultUsed.name,
        1
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Seele', dst: 'Seele' })
    const seele = convert(ownTag, { et: 'own', src: 'Seele' })

    expect(calc.compute(seele.final.brEffect_).val).toBeCloseTo(0.56)
    expect(calc.compute(seele.final.spd_).val).toBeCloseTo(0.16)
  })
})
