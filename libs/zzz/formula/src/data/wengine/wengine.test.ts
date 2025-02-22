import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { data, keys, values } from '..'
import {
  charTagMapNodeEntries,
  conditionals,
  teamData,
  wengineTagMapNodeEntries,
  withMember,
} from '../..'
import { Calculator } from '../../calculator'
import type { Read } from '../util'
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

function testCharacterData(wengineKey: WengineKey) {
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
      ...wengineTagMapNodeEntries(wengineKey, 60, 5, 5)
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
function cond(wKey: WengineKey, name: string, value: number) {
  return conditionalEntries(wKey, 'Anby', null)(name, value)
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}
describe('Disc sheets test', () => {
  it('BashfulDemon', () => {
    const data = testCharacterData('BashfulDemon')
    data.push(
      cond('BashfulDemon', conditionals.BashfulDemon.launch_ex_attack.name, 4)
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: 'Anby', dst: 'Anby' })
    const anby = convert(ownTag, { et: 'own', src: 'Anby' })
    printDebug(calc, anby.final.dmg_.ice)
    expect(calc.compute(anby.final.dmg_.ice).val).toBeCloseTo(0.24) // passive
    expect(calc.compute(anby.combat.atk_).val).toBeCloseTo(0.128) // cond
  })
})
