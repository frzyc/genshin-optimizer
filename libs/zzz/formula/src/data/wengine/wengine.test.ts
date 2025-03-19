import { prettify } from '@genshin-optimizer/common/util'
import {
  compileTagMapValues,
  setDebugMode,
} from '@genshin-optimizer/pando/engine'
import type {
  CharacterKey,
  SpecialityKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
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
  type TagMapNodeEntries,
  conditionalEntries,
  convert,
  enemy,
  enemyDebuff,
  own,
  ownTag,
} from '../util'

setDebugMode(true)
// This is generally unnecessary, but without it, some tags in `DebugCalculator` will be missing
Object.assign(values, compileTagMapValues(keys, data))
const specialityMap: Record<SpecialityKey, CharacterKey> = {
  attack: 'Billy',
  stun: 'Anby',
  anomaly: 'Piper',
  support: 'Nicole',
  defense: 'Ben',
}
function testCharacterData(wengineKey: WengineKey) {
  const type = getWengineStat(wengineKey).type
  const characterKey = specialityMap[type]
  const data: TagMapNodeEntries = [
    ...teamData([characterKey]),
    ...withMember(
      characterKey,
      ...charTagMapNodeEntries({
        level: 60,
        promotion: 5,
        key: characterKey,
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
  return { data, characterKey }
}
function cond(
  characterKey: CharacterKey,
  wKey: WengineKey,
  name: string,
  value: number
) {
  return conditionalEntries(wKey, characterKey, null)(name, value)
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function printDebug(calc: Calculator, read: Read) {
  console.log(prettify(calc.toDebug().compute(read)))
}
describe('Disc sheets test', () => {
  it('BashfulDemon', () => {
    const { data, characterKey } = testCharacterData('BashfulDemon')
    data.push(
      cond(
        characterKey,
        'BashfulDemon',
        conditionals.BashfulDemon.launch_ex_attack.name,
        4
      )
    )
    const calc = new Calculator(
      keys,
      values,
      compileTagMapValues(keys, data)
    ).withTag({ src: characterKey, dst: characterKey })
    const char = convert(ownTag, { et: 'own', src: characterKey })
    // printDebug(calc, char.combat.atk_)
    expect(calc.compute(char.final.dmg_.ice).val).toBeCloseTo(0.24) // passive
    expect(calc.compute(char.combat.atk_).val).toBeCloseTo(0.128) // cond
  })
})
