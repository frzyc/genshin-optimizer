import { crawlObject } from '@genshin-optimizer/util'
import KeyMap, { allEleEnemyResKeys } from '../KeyMap'
import {
  crittableTransformativeReactions,
  transformativeReactionLevelMultipliers,
} from '../KeyMap/StatConstants'
import { artifactTr } from '../names'
import {
  allArtifactSetKeys,
  allElementWithPhyKeys,
  allRegionKeys,
  allArtifactSlotKeys,
} from '@genshin-optimizer/consts'
import { objectKeyMap, objectKeyValueMap } from '../Util/Util'
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
const allMoves = [
  'normal',
  'charged',
  'plunging',
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
  ...allMoves.flatMap((x) => [
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

const talent = objectKeyMap(allTalents, (_) => read())
const allModStatNodes = objectKeyMap(allModStats, (key) =>
  read(undefined, KeyMap.info(key))
)
const allNonModStatNodes = objectKeyMap(allNonModStats, (key) =>
  read(undefined, KeyMap.info(key))
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
const input = setReadNodeKeys(
  deepNodeClone({
    activeCharKey: stringRead(),
    charKey: stringRead(),
    charEle: stringRead(),
    weaponType: stringRead(),
    lvl: read(undefined, { ...KeyMap.info('level'), prefix: 'char' }),
    constellation: read(),
    asc: read(),
    special: read(),

    infusion: {
      overridableSelf: stringRead('small'),
      nonOverridableSelf: stringRead('small'),
      team: stringRead('small'),
    },

    base: objectKeyMap(['atk', 'hp', 'def'], (key) =>
      read('add', KeyMap.info(key))
    ),
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
        ...objectKeyValueMap(allTalents, (talent) => [
          `${talent}Index`,
          read(),
        ]),
        ...allModStatNodes,
        ...allNonModStatNodes,
        /** Total Crit Rate capped to [0%, 100%] */
        cappedCritRate: read(undefined, KeyMap.info('critRate_')),
      }
    ),

    art: withDefaultInfo(
      { prefix: 'art', asConst },
      {
        ...objectKeyMap(allArtModStats, (key) => allModStatNodes[key]),
        ...objectKeyMap(allArtifactSlotKeys, (_) => ({
          id: stringRead(),
          set: stringRead(),
        })),
      }
    ),
    artSet: objectKeyMap(allArtifactSetKeys, (set) =>
      read('add', { name: artifactTr(set) })
    ),

    weapon: withDefaultInfo(
      { prefix: 'weapon', asConst },
      {
        id: stringRead(),
        key: stringRead(),
        type: stringRead(),

        lvl: read(),
        asc: read(),
        refinement: read(),
        refineIndex: read(),
        main: read(),
        sub: read(),
        sub2: read(),
      }
    ),

    enemy: {
      def: read('add', { ...KeyMap.info('enemyDef_multi_'), pivot }),
      ...objectKeyMap(
        allElements.map((ele) => `${ele}_resMulti_` as const),
        (_) => read()
      ),

      level: read(undefined, KeyMap.info('enemyLevel')),
      ...objectKeyValueMap(allElements, (ele) => [
        `${ele}_res_`,
        read(undefined, { prefix: 'base', ...KeyMap.info(`${ele}_enemyRes_`) }),
      ]),
      defRed: read(undefined),
      defIgn: read('add', { ...KeyMap.info('enemyDefIgn_'), pivot }),
    },

    hit: {
      reaction: stringRead(),
      ele: stringRead(),
      move: stringRead(),
      hitMode: stringRead(),
      base: read('add', KeyMap.info('base')),
      ampMulti: read(),
      addTerm: read(undefined, { pivot }),

      dmgBonus: read('add', { ...KeyMap.info('dmg_'), pivot }),
      dmgInc: read('add', KeyMap.info('dmgInc')),
      dmg: read(),
    },
  })
)

const { base, customBonus, premod, total, art, hit, enemy } = input

// Adjust `info` for printing
markAccu('add', {
  customBonus,
  premod,
  art,
  total: objectKeyMap(allModStats, (stat) => total[stat]),
})
base.atk.info = { ...KeyMap.info('atk'), prefix: 'base', pivot }
delete total.critRate_.info!.pivot
total.critRate_.info!.prefix = 'uncapped'

// Nodes that are not used anywhere else but `common` below

/** Base Amplifying Bonus */
const baseAmpBonus = infoMut(sum(one, prod(25 / 9, frac(total.eleMas, 1400))), {
  ...KeyMap.info('base_amplifying_multi_'),
  pivot,
})

/** Base Additive Bonus */
const baseAddBonus = sum(one, prod(5, frac(total.eleMas, 1200)))

const common: Data = {
  base: objectKeyMap(
    ['atk', 'def', 'hp'],
    (key) => input.customBonus[`base_${key}`]
  ),
  premod: {
    ...objectKeyMap(allTalents, (talent) => premod[`${talent}Boost`]),
    ...objectKeyMap(allNonModStats, (key) => {
      const operands: NumNode[] = []

      if (key.endsWith('_enemyRes_'))
        operands.push(enemy[key.replace(/_enemyRes_$/, '_res_')])

      const list = [...operands, customBonus[key]].filter((x) => x)
      return list.length === 1 ? list[0] : sum(...list)
    }),
    ...objectKeyMap(allModStats, (key) => {
      const operands: NumNode[] = []
      const info = KeyMap.info(key)
      switch (key) {
        case 'atk':
        case 'def':
        case 'hp':
          operands.push(prod(base[key], sum(one, premod[`${key}_`])))
          break
        case 'critRate_':
          operands.push(
            percent(0.05, { ...info, prefix: 'default' }),
            lookup(
              hit.move,
              objectKeyMap(allMoves, (move) => premod[`${move}_critRate_`]),
              0
            )
          )
          break
        case 'critDMG_':
          operands.push(
            percent(0.5, { ...info, prefix: 'default' }),
            lookup(
              hit.ele,
              objectKeyMap(allElements, (ele) => premod[`${ele}_critDMG_`]),
              0
            ),
            lookup(
              hit.move,
              objectKeyMap(allMoves, (ele) => premod[`${ele}_critDMG_`]),
              0
            )
          )
          break
        case 'enerRech_':
          operands.push(percent(1, { ...info, prefix: 'default' }))
          break
      }
      const list = [...operands, art[key], customBonus[key]].filter((x) => x)
      return list.length === 1 ? list[0] : sum(...list)
    }),
  },
  total: {
    ...objectKeyMap(allTalents, (talent) => premod[talent]),
    ...objectKeyMap(allModStats, (key) => premod[key]),
    ...objectKeyMap(allNonModStats, (key) => premod[key]),
    ...objectKeyValueMap(allTalents, (talent) => [
      `${talent}Index`,
      sum(total[talent], -1),
    ]),
    stamina: sum(
      constant(100, { ...KeyMap.info('stamina'), prefix: 'default' }),
      customBonus.stamina
    ),

    cappedCritRate: max(min(total.critRate_, one), naught),
  },

  hit: {
    dmgBonus: sum(
      total.all_dmg_,
      lookup(
        hit.move,
        objectKeyMap(allMoves, (move) => total[`${move}_dmg_`]),
        naught
      ),
      lookup(
        hit.ele,
        objectKeyMap(allElements, (ele) => total[`${ele}_dmg_`]),
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
            objectKeyMap(allElements, (element) => total[`${element}_dmgInc`]),
            NaN
          ),
          lookup(
            hit.move,
            objectKeyMap(allMoves, (move) => total[`${move}_dmgInc`]),
            NaN
          )
        ),
        { ...KeyMap.info('dmgInc'), pivot }
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
          KeyMap.info('spread_dmgInc')
        ),
        aggravate: equal(
          hit.ele,
          'electro',
          prod(
            subscript(input.lvl, transformativeReactionLevelMultipliers),
            1.15,
            sum(baseAddBonus, total.aggravate_dmg_)
          ),
          KeyMap.info('aggravate_dmgInc')
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
        objectKeyMap(allElements, (ele) => enemy[`${ele}_resMulti_` as const]),
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
              constant(2, KeyMap.info('vaporize_multi_')),
              sum(baseAmpBonus, total.vaporize_dmg_)
            ),
            pyro: prod(
              constant(1.5, KeyMap.info('vaporize_multi_')),
              sum(baseAmpBonus, total.vaporize_dmg_)
            ),
          },
          one
        ),
        melt: lookup(
          hit.ele,
          {
            pyro: prod(
              constant(2, KeyMap.info('melt_multi_')),
              sum(baseAmpBonus, total.melt_dmg_)
            ),
            cryo: prod(
              constant(1.5, KeyMap.info('melt_multi_')),
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
    defRed: total.enemyDefRed_,
    ...objectKeyValueMap(allElements, (ele) => [
      `${ele}_resMulti_`,
      res(total[`${ele}_enemyRes_`]),
    ]),
  },
}

const target = setReadNodeKeys(deepNodeClone(input), ['target'])
const _tally = setReadNodeKeys(
  {
    ...objectKeyMap([...allElements, ...allRegionKeys], (_) => read('add')),
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

export { input, uiInput, common, customBonus, target, tally }
