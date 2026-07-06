import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import { Translate } from '@genshin-optimizer/gi/i18n'
import {
  inferInfoMut,
  input,
  lookup,
  naught,
  one,
  percent,
} from '@genshin-optimizer/gi/wr'
import { Box } from '@mui/material'
import { st, stg } from './SheetUtil'
import {
  condPolestarStacks,
  condPolestarStacksPath,
  condStellarRadiance,
  condStellarRadiancePath,
} from './sharedConditionals'
import type { DocumentConditional } from './sheet'

const tr = (strKey: string) => <Translate ns="reaction_gen" key18={strKey} />
const trm = (strKey: string) => <Translate ns="reaction" key18={strKey} />

const stellarconductMultipliers = [
  0, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
]
const cryo_electro_dmg_arr = [
  0.2, 0.29, 0.3, 0.31, 0.32, 0.33, 0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.4,
]
const polestarStacksArr = range(0, stellarconductMultipliers.length - 1)
const polestarStacks_stellarconduct_mult_ = lookup(
  condPolestarStacks,
  objKeyMap(polestarStacksArr, (stack) =>
    percent(stellarconductMultipliers[stack])
  ),
  naught
)
const polestarStacks_cryo_dmg_ = lookup(
  condPolestarStacks,
  objKeyMap(polestarStacksArr, (stack) => percent(cryo_electro_dmg_arr[stack])),
  naught
)
const polestarStacks_electro_dmg_ = { ...polestarStacks_cryo_dmg_ }

export const reactionConditionals: DocumentConditional[] = [
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
    path: condStellarRadiancePath,
    value: condStellarRadiance,
    name: st('elementalReaction.polestar'),
    canShow: input.flags.canRadianceStellarconduct,
    teamBuff: true,
    states: {
      on: {
        fields: [
          {
            text: trm('gainRadiance'),
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
          src={imgAssets.reaction.stellarconductField}
          width="2em"
          height="auto"
        />
      ),
      description: tr('stellarconduct.fieldDesc'),
    },
    path: condPolestarStacksPath,
    value: condPolestarStacks,
    name: trm('polestarCond'),
    // Technically other elements can be inside the field and receive the buff, but it wouldn't be meaningful and clutters the UI like crazy
    canShow: lookup(
      input.charEle,
      { anemo: one, electro: one, cryo: one },
      naught
    ),
    states: objKeyMap(polestarStacksArr, (stack) => ({
      name: st('stack', { count: stack }),
      fields: [
        {
          node: polestarStacks_cryo_dmg_,
        },
        {
          node: polestarStacks_electro_dmg_,
        },
        {
          node: polestarStacks_stellarconduct_mult_,
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

export const reactionData = inferInfoMut({
  premod: {
    stellarconduct_mult_: polestarStacks_stellarconduct_mult_,
    cryo_dmg_: polestarStacks_cryo_dmg_,
    electro_dmg_: polestarStacks_electro_dmg_,
  },
})
