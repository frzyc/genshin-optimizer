import {
  objKeyMap,
  objKeyValMap,
  verifyObjKeys,
} from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  ElementKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi/consts'
import {
  allElementKeys,
  allLunarReactionKeys,
  allMainStatKeys,
} from '@genshin-optimizer/gi/consts'
import type { CharacterGrowCurveKey } from '@genshin-optimizer/gi/dm'
import { allStats, getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import type { Data, DisplaySub, NumNode } from '@genshin-optimizer/gi/wr'
import {
  constant,
  data,
  equal,
  greaterEq,
  inferInfoMut,
  infoMut,
  infusionNode,
  input,
  lookup,
  mergeData,
  min,
  one,
  percent,
  prod,
  reactions,
  stringPrio,
  subscript,
  sum,
  tally,
} from '@genshin-optimizer/gi/wr'
import { cond } from '../SheetUtil'

const commonBasic = objKeyMap(
  ['hp', 'atk', 'def', 'eleMas', 'enerRech_', 'critRate_', 'critDMG_', 'heal_'],
  (key) => input.total[key]
)

export const hitEle = objKeyMap(allElementKeys, (ele) => ({
  hit: { ele: constant(ele) },
}))

const inferredHitEle = stringPrio(
  lookup(
    input.hit.move,
    {
      skill: input.charEle,
      burst: input.charEle,
    },
    undefined
  ),
  lookup(
    input.weaponType,
    {
      sword: infusionNode,
      claymore: infusionNode,
      polearm: infusionNode,
      catalyst: input.charEle,
    },
    undefined
  ),
  'physical'
)

function getTalentType(
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst'
) {
  switch (move) {
    case 'normal':
    case 'charged':
    case 'plunging_collision':
    case 'plunging_impact':
      return 'auto'
    case 'skill':
      return 'skill'
    case 'burst':
      return 'burst'
  }
}

/** Note: `additional` applies only to this formula */
export function customDmgNode(
  base: NumNode,
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst'
    | 'elemental',
  additional: Data = {}
): NumNode {
  return data(
    input.hit.dmg,
    mergeData([
      {
        hit: {
          base,
          move: constant(move),
          ele: additional?.hit?.ele ? undefined : inferredHitEle,
        },
      },
      additional,
    ])
  )
}
/** Note: `additional` applies only to this formula */
export function customShieldNode(base: NumNode, additional?: Data): NumNode {
  const shieldNode = prod(base, sum(one, input.total.shield_))
  return additional ? data(shieldNode, additional) : shieldNode
}
/** Note: `additional` applies only to this formula */
export function customHealNode(base: NumNode, additional?: Data): NumNode {
  const healInc = input.total.healInc
  const healNode = prod(
    sum(base, healInc),
    sum(one, input.total.heal_, input.total.incHeal_)
  )

  return additional ? data(healNode, additional) : healNode
}

/**
 * Note: `additional` applies only to this formula
 * @param base
 * @param lvlMultiplier
 * @param move Sets the damage type and the talent level to look at. Can override the talent level with overrideTalentType
 * @param additional
 * @param specialMultiplier
 * @param overrideTalentType Overrides the talent level to look at
 * @returns
 */
export function dmgNode(
  base: MainStatKey | SubstatKey,
  lvlMultiplier: number[],
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst',
  additional: Data = {},
  specialMultiplier?: NumNode,
  overrideTalentType?: 'skill' | 'burst' | 'auto'
): NumNode {
  const talentType = overrideTalentType ?? getTalentType(move)
  return customDmgNode(
    prod(
      subscript(input.total[`${talentType}Index`], lvlMultiplier, {
        unit: '%',
      }),
      input.total[base],
      ...(specialMultiplier ? [infoMut(specialMultiplier, { unit: '%' })] : [])
    ),
    move,
    additional
  )
}
/** Note: `additional` applies only to this formula */
export function splitScaleDmgNode(
  bases: (MainStatKey | SubstatKey)[],
  lvlMultipliers: number[][],
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst',
  additional: Data = {},
  specialMultiplier?: NumNode,
  overrideTalentType?: 'skill' | 'burst' | 'auto'
): NumNode {
  const talentType = overrideTalentType ?? getTalentType(move)
  return customDmgNode(
    sum(
      ...bases.map((base, i) =>
        prod(
          subscript(input.total[`${talentType}Index`], lvlMultipliers[i], {
            unit: '%',
          }),
          input.total[base],
          ...(specialMultiplier
            ? [infoMut(specialMultiplier, { unit: '%' })]
            : [])
        )
      )
    ),
    move,
    additional
  )
}
const allPlungingDmgKeys = ['dmg', 'low', 'high'] as const
type PlungingDmgKey = (typeof allPlungingDmgKeys)[number]
export function plungingDmgNodes(
  base: MainStatKey | SubstatKey,
  lvlMultipliers: Record<PlungingDmgKey, number[]>,
  additional: Data = {},
  specialMultiplier?: NumNode,
  overrideTalentType?: 'skill' | 'burst' | 'auto'
): Record<PlungingDmgKey, NumNode> {
  const nodes = Object.fromEntries(
    Object.entries(lvlMultipliers).map(([key, multi]) => [
      key,
      dmgNode(
        base,
        multi,
        key === 'dmg' ? 'plunging_collision' : 'plunging_impact',
        additional,
        specialMultiplier,
        overrideTalentType
      ),
    ])
  )
  verifyObjKeys(nodes, allPlungingDmgKeys)
  return nodes
}

/** Note: `additional` applies only to this formula */
export function shieldNode(
  base: MainStatKey | SubstatKey,
  percent: NumNode | number,
  flat: NumNode | number,
  additional?: Data
): NumNode {
  return customShieldNode(
    sum(prod(percent, input.total[base]), flat),
    additional
  )
}
/** Note: `additional` applies only to this formula */
export function healNode(
  base: MainStatKey | SubstatKey,
  percent: NumNode | number,
  flat: NumNode | number,
  additional?: Data
): NumNode {
  return customHealNode(sum(prod(percent, input.total[base]), flat), additional)
}
/** Note: `additional` applies only to this formula */
export function shieldNodeTalent(
  base: MainStatKey | SubstatKey,
  baseMultiplier: number[],
  flat: number[],
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst',
  additional?: Data,
  multiplier?: NumNode | number
): NumNode {
  const talentType = getTalentType(move)
  const talentIndex = input.total[`${talentType}Index`]
  return customShieldNode(
    sum(
      prod(
        subscript(talentIndex, baseMultiplier, { unit: '%' }),
        input.total[base],
        ...(multiplier ? [multiplier] : [])
      ),
      subscript(talentIndex, flat)
    ),
    additional
  )
}
export function shieldElement(element: ElementKey, shieldNode: NumNode) {
  return infoMut(prod(percent(element === 'geo' ? 1.5 : 2.5), shieldNode), {
    variant: element,
  })
}
/** Note: `additional` applies only to this formula */
export function healNodeTalent(
  base: MainStatKey | SubstatKey,
  baseMultiplier: number[],
  flat: number[],
  move:
    | 'normal'
    | 'charged'
    | 'plunging_collision'
    | 'plunging_impact'
    | 'skill'
    | 'burst',
  additional?: Data,
  multiplier?: NumNode | number
): NumNode {
  const talentType = getTalentType(move)
  const talentIndex = input.total[`${talentType}Index`]
  return customHealNode(
    sum(
      prod(
        subscript(talentIndex, baseMultiplier, { unit: '%' }),
        input.total[base],
        ...(multiplier ? [multiplier] : [])
      ),
      prod(subscript(talentIndex, flat), ...(multiplier ? [multiplier] : []))
    ),
    additional
  )
}
export function dataObjForCharacterSheet(
  key: CharacterKey,
  display: { [key: string]: DisplaySub },
  additional: Data = {}
): Data {
  function curve(base: number, lvlCurve: CharacterGrowCurveKey): NumNode {
    return prod(
      base,
      subscript<number>(input.lvl, allStats.char.expCurve[lvlCurve])
    )
  }
  const [_condMoonsignAfterSkillBurstPath, condMoonsignAfterSkillBurst] = cond(
    key,
    'moonsignAfterSkillBurst'
  )
  function moonsignBuff(value: NumNode): NumNode {
    const teamSize = sum(...allElementKeys.map((ele) => tally[ele]))
    return greaterEq(
      teamSize,
      4,
      greaterEq(
        tally.moonsign,
        2,
        equal(condMoonsignAfterSkillBurst, 'on', min(value, percent(0.36)))
      )
    )
  }
  const element = getCharEle(key)
  const { region, weaponType, lvlCurves, ascensionBonus, baseStats } =
    getCharStat(key)
  display['basic'] = { ...commonBasic }
  const data: Data = {
    charKey: constant(key),
    base: {},
    weaponType: constant(weaponType),
    premod: {},
    display,
    teamBuff: { tally: { maxEleMas: input.premod.eleMas } },
  }
  if (element) {
    data.charEle = constant(element)
    data.teamBuff!.tally![element] = constant(1)
    data.display!['basic'][`${element}_dmg_`] = input.total[`${element}_dmg_`]
    data.display!['reaction'] = reactions[element]
    if (region !== 'nodKrai') {
      let moonsign: NumNode
      switch (element) {
        case 'pyro':
        case 'electro':
        case 'cryo':
          moonsign = moonsignBuff(
            prod(input.total.atk, 1 / 100, percent(0.009))
          )
          break
        case 'hydro':
          moonsign = moonsignBuff(
            prod(input.total.hp, 1 / 1000, percent(0.006))
          )
          break
        case 'geo':
          moonsign = moonsignBuff(prod(input.total.def, 1 / 100, percent(0.01)))
          break
        case 'anemo':
        case 'dendro':
          moonsign = moonsignBuff(
            prod(input.total.eleMas, 1 / 100, percent(0.0225))
          )
          break
      }
      data.teamBuff!.tally!.maxMoonsignBuff = moonsign
      data.display!['moonsign'] = objKeyValMap(allLunarReactionKeys, (lr) => [
        `${lr}_dmg_`,
        { ...moonsign },
      ])
    }
  }
  if (region) data.teamBuff!.tally![region] = constant(1)
  if (weaponType !== 'catalyst')
    data.display!['basic']!['physical_dmg_'] = input.total.physical_dmg_

  for (const stat of [...allMainStatKeys, 'def' as const]) {
    const list: NumNode[] = []
    const lvlCurveBase = lvlCurves.find((lc) => lc.key === stat)
    if (lvlCurveBase) list.push(curve(lvlCurveBase.base, lvlCurveBase.curve))

    const asc = ascensionBonus[stat]
    if (asc) list.push(subscript(input.asc, asc))
    const otherBase = stat === 'def' ? undefined : baseStats?.[stat]
    if (otherBase) list.push(constant(otherBase))

    if (!list.length) continue

    const result = infoMut(list.length === 1 ? list[0] : sum(...list), {
      path: stat,
      prefix: 'char',
      asConst: true,
    })
    if (stat.endsWith('_dmg_')) result.info!.variant = stat.slice(0, -5) as any
    if (stat === 'atk' || stat === 'def' || stat === 'hp')
      data.base![stat] = result
    else {
      // Special ascension stat
      if (asc) {
        if (data.special) throw new Error('Multiple Char Special')
        data.special = result
        data.premod![stat] = input.special
      }
      // Other base stat
      else {
        data.premod![stat] = result
      }
    }
  }

  return mergeData([data, inferInfoMut(additional)])
}
