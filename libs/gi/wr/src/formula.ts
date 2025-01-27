import {
  crawlObject,
  objKeyMap,
  objKeyValMap,
} from '@genshin-optimizer/common/util'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allElementWithPhyKeys,
  allRegionKeys,
} from '@genshin-optimizer/gi/consts'
import {
  allEleEnemyResKeys,
  crittableTransformativeReactions,
  transformativeReactionLevelMultipliers,
} from '@genshin-optimizer/gi/keymap'
import { info } from './info'
import { deepNodeClone } from './internal'
import type { Data, Info, NodeData, NumNode, ReadNode, StrNode } from './type'
import {
  constant,
  equal,
  frac,
  infoMut,
  lookup,
  max,
  min,
  naught,
  none,
  one,
  percent,
  prod,
  read,
  res,
  setReadNodeKeys,
  stringPrio,
  stringRead,
  subscript,
  sum,
  unequal,
  unequalStr,
} from './utils'

const asConst = true as const,
  pivot = true as const

const allElements = allElementWithPhyKeys
const allTalents = ['auto', 'skill', 'burst'] as const
const allNonstackBuffs = [
  'no4',
  'totm4',
  'ap4',
  'inst4',
  'vv4pyro',
  'vv4hydro',
  'vv4electro',
  'vv4cryo',
  'dm4',
  'scroll4basepyro',
  'scroll4basehydro',
  'scroll4baseelectro',
  'scroll4basecryo',
  'scroll4baseanemo',
  'scroll4basegeo',
  'scroll4basedendro',
  'scroll4nspyro',
  'scroll4nshydro',
  'scroll4nselectro',
  'scroll4nscryo',
  'scroll4nsanemo',
  'scroll4nsgeo',
  'scroll4nsdendro',
  'millenialatk',
  'patrol',
  'key',
  'crane',
  'starcaller',
  'leafCon',
  'leafRev',
  'hakushinpyro',
  'hakushinhydro',
  'hakushinelectro',
  'hakushincryo',
  'hakushinanemo',
  'hakushingeo',
  'hakushindendro',
  'ttds',
  'wolf',
] as const
export type NonStackBuff = (typeof allNonstackBuffs)[number]
const allMoves = [
  'normal',
  'charged',
  'plunging_collision',
  'plunging_impact',
  'skill',
  'burst',
  'elemental',
] as const
const allArtModStats = [
  'hp',
  'hp_',
  'atk',
  'atk_',
  'def',
  'def_',
  'eleMas',
  'enerRech_',
  'critRate_',
  'critDMG_',
  'electro_dmg_',
  'hydro_dmg_',
  'pyro_dmg_',
  'cryo_dmg_',
  'physical_dmg_',
  'anemo_dmg_',
  'geo_dmg_',
  'dendro_dmg_',
  'heal_',
] as const
const allTransformative = [
  'overloaded',
  'shattered',
  'electrocharged',
  'superconduct',
  'swirl',
  'burning',
  'bloom',
  'burgeon',
  'hyperbloom',
] as const
const allAmplifying = ['vaporize', 'melt'] as const
const allAdditive = ['spread', 'aggravate'] as const
const allMisc = [
  'stamina',
  'staminaDec_',
  'staminaSprintDec_',
  'staminaGlidingDec_',
  'staminaChargedDec_',
  'incHeal_',
  'shield_',
  'cdRed_',
  'moveSPD_',
  'atkSPD_',
  'weakspotDMG_',
  'dmgRed_',
  'healInc',
] as const
const allBase = ['base_atk', 'base_hp', 'base_def'] as const

const allModStats = [
  ...allArtModStats,
  ...(
    [
      'all',
      ...allTransformative,
      ...allAmplifying,
      ...allAdditive,
      ...allMoves,
      'plunging',
      'normalEle',
    ] as const
  ).map((x) => `${x}_dmg_` as const),
] as const
const allNonModStats = [
  ...allElements.flatMap((x) => [
    `${x}_dmgInc` as const,
    `${x}_critDMG_` as const,
    `${x}_res_` as const,
  ]),
  ...allTalents.map((x) => `${x}Boost` as const),
  ...([...allMoves, 'plunging'] as const).flatMap((x) => [
    `${x}_dmgInc` as const,
    `${x}_critDMG_` as const,
    `${x}_critRate_` as const,
  ]),
  ...crittableTransformativeReactions.flatMap((x) => [
    `${x}_critRate_` as const,
    `${x}_critDMG_` as const,
  ]),
  'all_dmgInc' as const,
  ...allEleEnemyResKeys,
  'enemyDefRed_' as const,
  'enemyDefIgn_' as const,
  ...allMisc,
  ...allBase,
] as const

export const allInputPremodKeys = [...allModStats, ...allNonModStats] as const

export type InputPremodKey = (typeof allInputPremodKeys)[number]

const talent = objKeyMap(allTalents, (t) =>
  read(undefined, { ...info(t), prefix: 'char' })
)
const allModStatNodes = objKeyMap(allModStats, (key) =>
  read(undefined, info(key))
)
const allNonModStatNodes = objKeyMap(allNonModStats, (key) =>
  read(undefined, info(key))
)

for (const ele of allElements) {
  allNonModStatNodes[`${ele}_res_`].info!.variant = ele
  allNonModStatNodes[`${ele}_enemyRes_`].info!.variant = ele
  allNonModStatNodes[`${ele}_critDMG_`].info!.variant = ele
  allNonModStatNodes[`${ele}_dmgInc`].info!.variant = ele
  allModStatNodes[`${ele}_dmg_`].info!.variant = ele
}
for (const reaction of [
  ...allTransformative,
  ...allAmplifying,
  ...allAdditive,
]) {
  allModStatNodes[`${reaction}_dmg_`].info!.variant = reaction
}
crittableTransformativeReactions.forEach((reaction) => {
  allNonModStatNodes[`${reaction}_critRate_`].info!.variant = reaction
  allNonModStatNodes[`${reaction}_critDMG_`].info!.variant = reaction
})
allNonModStatNodes.healInc.info!.variant = 'heal'
allNonModStatNodes.incHeal_.info!.variant = 'heal'
allModStatNodes.heal_.info!.variant = 'heal'

function withDefaultInfo<T extends NodeData<NumNode | StrNode>>(
  info: Info,
  value: T
): T {
  value = deepNodeClone(value)
  crawlObject(
    value,
    [],
    (x: any) => x.operation,
    (x: NumNode | StrNode) => (x.info = { ...info, ...x.info })
  )
  return value
}
function markAccu<T>(accu: ReadNode<number>['accu'], value: T): void {
  crawlObject(
    value,
    [],
    (x: any) => x.operation,
    (x: NumNode | StrNode) => {
      if (x.operation === 'read' && x.type === 'number') x.accu = accu
    }
  )
}

/** All read nodes */
const inputBase = {
  activeCharKey: stringRead(),
  charKey: stringRead(),
  charEle: stringRead(),
  weaponType: stringRead(),
  lvl: read(undefined, { ...info('level'), prefix: 'char' }),
  constellation: read(undefined, { ...info('constellation'), prefix: 'char' }),
  asc: read(undefined, { ...info('ascension'), prefix: 'char' }),
  special: read(),

  infusion: {
    overridableSelf: stringRead('small'),
    nonOverridableSelf: stringRead('small'),
    team: stringRead('small'),
  },

  base: objKeyMap(['atk', 'hp', 'def'], (key) => read('add', info(key))),
  customBonus: withDefaultInfo(
    { prefix: 'custom', pivot },
    {
      ...allModStatNodes,
      ...allNonModStatNodes,
    }
  ),
  premod: { ...talent, ...allModStatNodes, ...allNonModStatNodes },
  total: withDefaultInfo(
    { prefix: 'total', pivot },
    {
      ...talent,
      ...objKeyValMap(allTalents, (talent) => [`${talent}Index`, read()]),
      ...allModStatNodes,
      ...allNonModStatNodes,
      /** Total Crit Rate capped to [0%, 100%] */
      cappedCritRate: read(undefined, info('critRate_')),
    }
  ),

  art: withDefaultInfo(
    { prefix: 'art', asConst },
    {
      ...objKeyMap(allArtModStats, (key) => allModStatNodes[key]),
      ...objKeyMap(allArtifactSlotKeys, (_) => ({
        id: stringRead(),
        set: stringRead(),
      })),
    }
  ),
  artSet: objKeyMap(allArtifactSetKeys, (set) => read('add', { path: set })),

  weapon: withDefaultInfo(
    { prefix: 'weapon', asConst },
    {
      id: stringRead(),
      key: stringRead(),
      type: stringRead(),

      lvl: read(),
      asc: read(),
      refinement: read(),
      main: read(),
      sub: read(),
      sub2: read(),
    }
  ),

  enemy: {
    def: read('add', { ...info('enemyDef_multi_'), pivot }),
    transDef: read('add', { ...info('enemyDef_multi_'), pivot }),
    ...objKeyMap(
      allElements.map((ele) => `${ele}_resMulti_` as const),
      (_) => read()
    ),

    level: read(undefined, info('enemyLevel')),
    ...objKeyValMap(allElements, (ele) => [
      `${ele}_res_`,
      read(undefined, { prefix: 'base', ...info(`${ele}_enemyRes_`) }),
    ]),
    defRed: read(undefined),
    defIgn: read(undefined),
  },

  hit: {
    reaction: stringRead(),
    ele: stringRead(),
    move: stringRead(),
    hitMode: stringRead(),
    base: read('add', info('base')),
    ampMulti: read(),
    addTerm: read(undefined, { pivot }),

    dmgBonus: read('add', { ...info('dmg_'), pivot }),
    dmgInc: read('add', info('dmgInc')),
    dmg: read(),
  },
}
const input = setReadNodeKeys(deepNodeClone(inputBase))
const { base, customBonus, premod, total, art, hit, enemy } = input

// Adjust `info` for printing
markAccu('add', {
  customBonus,
  premod,
  art,
  total: objKeyMap(allModStats, (stat) => total[stat]),
})
base.atk.info = { ...info('atk'), prefix: 'base', pivot }
delete total.critRate_.info!.pivot
total.critRate_.info!.prefix = 'uncapped'

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = infoMut(sum(one, prod(25 / 9, frac(total.eleMas, 1400))), {
  ...info('base_amplifying_multi_'),
  pivot,
})

/** Base Additive Bonus */
const baseAddBonus = sum(one, prod(5, frac(total.eleMas, 1200)))

const common: Data = {
  base: objKeyMap(
    ['atk', 'def', 'hp'],
    (key) => input.customBonus[`base_${key}`]
  ),
  premod: {
    ...objKeyMap(allTalents, (talent) => premod[`${talent}Boost`]),
    ...objKeyMap(allNonModStats, (key) => {
      const operands: NumNode[] = []

      if (key.endsWith('_enemyRes_'))
        operands.push(
          enemy[key.replace(/_enemyRes_$/, '_res_') as keyof typeof enemy]
        )

      const list = [...operands, customBonus[key]].filter((x) => x)
      return list.length === 1 ? list[0] : sum(...list)
    }),
    ...objKeyMap(allModStats, (key) => {
      const operands: NumNode[] = []
      const inf = info(key)
      switch (key) {
        case 'atk':
        case 'def':
        case 'hp':
          operands.push(prod(base[key], sum(one, premod[`${key}_`])))
          break
        case 'critRate_':
          operands.push(
            percent(0.05, { ...inf, prefix: 'default' }),
            lookup(
              hit.move,
              // Plunging buff applies to both collision and shockwave types
              objKeyMap(allMoves, (move) =>
                move.includes('plunging')
                  ? sum(premod[`${move}_critRate_`], premod.plunging_critRate_)
                  : premod[`${move}_critRate_`]
              ),
              0
            )
          )
          break
        case 'critDMG_':
          operands.push(
            percent(0.5, { ...info, prefix: 'default' }),
            lookup(
              hit.ele,
              objKeyMap(allElements, (ele) => premod[`${ele}_critDMG_`]),
              0
            ),
            lookup(
              hit.move,
              // Plunging buff applies to both collision and shockwave types
              objKeyMap(allMoves, (move) =>
                move.includes('plunging')
                  ? sum(premod[`${move}_critDMG_`], premod.plunging_critDMG_)
                  : premod[`${move}_critDMG_`]
              ),
              0
            )
          )
          break
        case 'enerRech_':
          operands.push(percent(1, { ...info, prefix: 'default' }))
          break
      }
      const list = [
        ...operands,
        art[key as keyof typeof art] as NumNode,
        customBonus[key],
      ].filter((x) => x)
      return list.length === 1 ? list[0] : sum(...list)
    }),
  },
  total: {
    ...objKeyMap(allTalents, (talent) => premod[talent]),
    ...objKeyMap(allModStats, (key) => premod[key]),
    ...objKeyMap(allNonModStats, (key) => premod[key]),
    ...objKeyValMap(allTalents, (talent) => [
      `${talent}Index`,
      sum(total[talent], -1),
    ]),
    stamina: sum(
      constant(100, { ...info('stamina'), prefix: 'default' }),
      customBonus.stamina
    ),

    cappedCritRate: max(min(total.critRate_, one), naught),
  },

  hit: {
    dmgBonus: sum(
      total.all_dmg_,
      lookup(
        hit.move,
        // Plunging buff applies to both collision and shockwave types
        objKeyMap(allMoves, (move) =>
          move.includes('plunging')
            ? sum(total[`${move}_dmg_`], total.plunging_dmg_)
            : total[`${move}_dmg_`]
        ),
        naught
      ),
      lookup(
        hit.ele,
        objKeyMap(allElements, (ele) => total[`${ele}_dmg_`]),
        naught
      ),
      equal(
        hit.move,
        'normal',
        unequal(hit.ele, 'physical', total.normalEle_dmg_)
      )
    ),
    dmgInc: sum(
      infoMut(
        sum(
          total.all_dmgInc,
          lookup(
            hit.ele,
            objKeyMap(allElements, (element) => total[`${element}_dmgInc`]),
            NaN
          ),
          lookup(
            hit.move,
            // Plunging buff applies to both collision and shockwave types
            objKeyMap(allMoves, (move) =>
              move.includes('plunging')
                ? sum(total[`${move}_dmgInc`], total.plunging_dmgInc)
                : total[`${move}_dmgInc`]
            ),
            NaN
          )
        ),
        { ...info('dmgInc'), pivot }
      ),
      hit.addTerm
    ),
    addTerm: lookup(
      hit.reaction,
      {
        spread: equal(
          hit.ele,
          'dendro',
          prod(
            subscript(input.lvl, transformativeReactionLevelMultipliers),
            1.25,
            sum(baseAddBonus, total.spread_dmg_)
          ),
          info('spread_dmgInc')
        ),
        aggravate: equal(
          hit.ele,
          'electro',
          prod(
            subscript(input.lvl, transformativeReactionLevelMultipliers),
            1.15,
            sum(baseAddBonus, total.aggravate_dmg_)
          ),
          info('aggravate_dmgInc')
        ),
      },
      naught
    ),
    dmg: prod(
      sum(hit.base, hit.dmgInc),
      sum(one, hit.dmgBonus),
      lookup(
        hit.hitMode,
        {
          hit: one,
          critHit: sum(one, total.critDMG_),
          avgHit: sum(one, prod(total.cappedCritRate, total.critDMG_)),
        },
        NaN
      ),
      enemy.def,
      lookup(
        hit.ele,
        objKeyMap(allElements, (ele) => enemy[`${ele}_resMulti_` as const]),
        NaN
      ),
      hit.ampMulti
    ),
    ampMulti: lookup(
      hit.reaction,
      {
        vaporize: lookup(
          hit.ele,
          {
            hydro: prod(
              constant(2, info('vaporize_multi_')),
              sum(baseAmpBonus, total.vaporize_dmg_)
            ),
            pyro: prod(
              constant(1.5, info('vaporize_multi_')),
              sum(baseAmpBonus, total.vaporize_dmg_)
            ),
          },
          one
        ),
        melt: lookup(
          hit.ele,
          {
            pyro: prod(
              constant(2, info('melt_multi_')),
              sum(baseAmpBonus, total.melt_dmg_)
            ),
            cryo: prod(
              constant(1.5, info('melt_multi_')),
              sum(baseAmpBonus, total.melt_dmg_)
            ),
          },
          one
        ),
      },
      one
    ),
  },

  enemy: {
    // TODO: shred cap of 90%
    def: frac(
      sum(input.lvl, 100),
      prod(
        sum(enemy.level, 100),
        sum(one, prod(-1, enemy.defRed)),
        sum(one, prod(-1, enemy.defIgn))
      )
    ),
    transDef: frac(
      99999999,
      prod(
        sum(prod(5, enemy.level), 500),
        sum(one, prod(-1, enemy.defRed)),
        sum(one, prod(-1, enemy.defIgn))
      )
    ),
    defRed: total.enemyDefRed_,
    ...objKeyValMap(allElements, (ele) => [
      `${ele}_resMulti_`,
      res(total[`${ele}_enemyRes_`]),
    ]),
    defIgn: total.enemyDefIgn_,
  },
}

const target = setReadNodeKeys(deepNodeClone(input), ['target'])
const _tally = setReadNodeKeys(
  {
    ...objKeyMap([...allElements, ...allRegionKeys], (_) => read('add')),
    maxEleMas: read('max'),
  },
  ['tally']
)
const tally = {
  ..._tally,
  // Special handling since it's not a `ReadNode`
  ele: sum(...allElements.map((ele) => min(_tally[ele], 1))),
}

/**
 * List of `input` nodes, rearranged to conform to the needs of the
 * UI code. This is a separate list so that the evolution of the UIs
 * does not rely on the structure of `input`. So the UI code can rearrange
 * nodes as it sees fit without requiring updates to data sheets, which
 * pertains ~90% of all `input`-related code, and so are very sensitive
 * to any changes to `input`. For zero overhead, use the nodes directly
 * from `input` instead of a copy.
 */
const uiInput = input

export const infusionNode = stringPrio(
  input.infusion.nonOverridableSelf,
  unequalStr(input.infusion.team, none, input.infusion.team),
  input.infusion.overridableSelf
)

export { common, customBonus, input, tally, target, uiInput }
