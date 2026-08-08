import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import { Translate } from '@genshin-optimizer/gi/i18n'
import {
  compareEq,
  equal,
  greaterEq,
  inferInfoMut,
  input,
  lookup,
  mergeData,
  naught,
  percent,
  sum,
  tally,
  unequal,
} from '@genshin-optimizer/gi/wr'
import { Box } from '@mui/material'
import { activeCharBuff, condReadNode, st, stg } from './SheetUtil'
import type { DocumentConditional } from './sheet'

const tr = (strKey: string) => <Translate ns="reaction_gen" key18={strKey} />

const stellarconductMultipliers = [
  0, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
]
const cryo_electro_dmg_arr = [
  0.2, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4,
]

const condPolestarStacksPath = ['reaction', 'polestarStacks']
const condPolestarStacks = condReadNode(condPolestarStacksPath)

const polestarStacksArr = range(0, stellarconductMultipliers.length - 1)
const [
  polestarStacks_stellarconduct_mult_disp,
  polestarStacks_stellarconduct_mult_,
] = activeCharBuff(
  input.charKey,
  greaterEq(
    sum(tally.cryo, tally.electro),
    1,
    lookup(
      condPolestarStacks,
      objKeyMap(polestarStacksArr, (stack) =>
        percent(stellarconductMultipliers[stack])
      ),
      naught
    )
  ),
  { path: 'stellarconduct_mult_' }
)
const [polestarStacks_cryo_dmg_disp, polestarStacks_cryo_dmg_] = activeCharBuff(
  input.charKey,
  greaterEq(
    sum(tally.cryo, tally.electro),
    1,
    lookup(
      condPolestarStacks,
      objKeyMap(polestarStacksArr, (stack) =>
        percent(cryo_electro_dmg_arr[stack])
      ),
      naught
    )
  ),
  { path: 'cryo_dmg_' }
)
const [polestarStacks_electro_dmg_disp, polestarStacks_electro_dmg_] =
  activeCharBuff(
    input.charKey,
    greaterEq(
      sum(tally.cryo, tally.electro),
      1,
      lookup(
        condPolestarStacks,
        objKeyMap(polestarStacksArr, (stack) =>
          percent(cryo_electro_dmg_arr[stack])
        ),
        naught
      )
    ),
    { path: 'electro_dmg_' }
  )

const condSuperconductPath = ['reaction', 'superconduct']
const condSuperconduct = condReadNode(condSuperconductPath)
const condOppInsidePolePath = ['reaction', 'oppInsidePole']
const condOppInsidePole = condReadNode(condOppInsidePolePath)
const [superconduct_physical_enemyRes_disp, superconduct_physical_enemyRes_] =
  activeCharBuff(
    input.charKey,
    greaterEq(
      sum(tally.cryo, tally.electro),
      1,
      equal(condSuperconduct, 'on', -0.4)
    ),
    {
      path: 'physical_enemyRes_',
    }
  )
const oppInsidePole_physical_enemyRes_disp = greaterEq(
  sum(tally.cryo, tally.electro),
  1,
  equal(
    condOppInsidePole,
    'on',
    compareEq(
      condSuperconduct,
      'on',
      percent(-0.4, {
        path: 'physical_enemyRes_',
        isTeamBuff: true,
        strikethrough: true,
      }),
      percent(-0.4, { path: 'physical_enemyRes_', isTeamBuff: true })
    )
  )
)
const [, oppInsidePole_physical_enemyRes_] = activeCharBuff(
  input.charKey,
  greaterEq(
    sum(tally.cryo, tally.electro),
    1,
    equal(condOppInsidePole, 'on', unequal(condSuperconduct, 'on', -0.4))
  ),
  { path: 'physical_enemyRes_' }
)

export const reactionConditionals: DocumentConditional[] = [
  {
    header: {
      title: tr('superconduct.name'),
      icon: (
        <Box
          component="img"
          src={imgAssets.reaction.superconduct}
          width="2em"
          height="auto"
        />
      ),
      description: tr('superconduct.desc'),
    },
    path: condSuperconductPath,
    value: condSuperconduct,
    name: st('enemyAffected.superconduct'),
    teamBuff: true,
    canShow: greaterEq(sum(tally.cryo, tally.electro), 1, 1),
    states: {
      on: {
        fields: [
          {
            node: superconduct_physical_enemyRes_disp,
          },
          {
            text: stg('duration'),
            value: 12,
            unit: 's',
          },
        ],
      },
    },
  },
  {
    header: {
      title: tr('stellarconduct.name'),
      icon: (
        <Box
          component="img"
          src={imgAssets.reaction.stellarconduct}
          width="2em"
          height="auto"
        />
      ),
      description: tr('stellarconduct.desc'),
    },
    path: condOppInsidePolePath,
    value: condOppInsidePole,
    name: st('elementalReaction.polestar.oppInside'),
    teamBuff: true,
    canShow: greaterEq(sum(tally.cryo, tally.electro), 1, 1),
    states: {
      on: {
        fields: [
          {
            node: oppInsidePole_physical_enemyRes_disp,
          },
        ],
      },
    },
  },
  {
    header: {
      title: tr('stellarconduct.fieldName'),
      icon: (
        <Box
          component="img"
          src={imgAssets.reaction.polestarField}
          width="2em"
          height="auto"
        />
      ),
      description: tr('stellarconduct.fieldDesc'),
    },
    path: condPolestarStacksPath,
    value: condPolestarStacks,
    name: st('elementalReaction.polestar.cond'),
    teamBuff: true,
    canShow: greaterEq(sum(tally.cryo, tally.electro), 1, 1),
    states: objKeyMap(polestarStacksArr, (stack) => ({
      name: st('stack', { count: stack }),
      fields: [
        {
          node: polestarStacks_cryo_dmg_disp,
        },
        {
          node: polestarStacks_electro_dmg_disp,
        },
        {
          node: polestarStacks_stellarconduct_mult_disp,
        },
        {
          text: stg('duration'),
          value: 4,
          unit: 's',
        },
      ],
    })),
  },
]

export const reactionData = mergeData([
  inferInfoMut({
    teamBuff: {
      premod: {
        stellarconduct_mult_: polestarStacks_stellarconduct_mult_,
        cryo_dmg_: polestarStacks_cryo_dmg_,
        electro_dmg_: polestarStacks_electro_dmg_,
        physical_enemyRes_: superconduct_physical_enemyRes_,
      },
    },
  }),
  inferInfoMut({
    teamBuff: {
      premod: {
        physical_enemyRes_: oppInsidePole_physical_enemyRes_,
      },
    },
  }),
])
