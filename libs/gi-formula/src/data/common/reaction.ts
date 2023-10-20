import type {
  ElementWithPhyKey,
  TransformativeReactionKey,
} from '@genshin-optimizer/consts'
import {
  allElementKeys,
  allElementWithPhyKeys,
  allTransformativeReactionKeys,
} from '@genshin-optimizer/consts'
import type { NumNode, StrNode } from '@genshin-optimizer/pando'
import {
  cmpEq,
  lookup,
  prod,
  subscript,
  sum,
  sumfrac,
} from '@genshin-optimizer/pando'
import type { TagMapNodeEntries } from '../util'
import { percent, self, selfBuff, tag } from '../util'

const transLvlMultis = [
  NaN, // lvl 0
  17.165606,
  18.535048,
  19.904854,
  21.274902,
  22.6454,
  24.649612,
  26.640642,
  28.868587,
  31.36768,
  34.143345,
  37.201,
  40.66,
  44.446667,
  48.56352,
  53.74848,
  59.081898,
  64.420044,
  69.72446,
  75.12314,
  80.58478,
  86.11203,
  91.70374,
  97.24463,
  102.812645,
  108.40956,
  113.20169,
  118.102905,
  122.97932,
  129.72733,
  136.29291,
  142.67085,
  149.02902,
  155.41699,
  161.8255,
  169.10631,
  176.51808,
  184.07274,
  191.70952,
  199.55692,
  207.38205,
  215.3989,
  224.16566,
  233.50217,
  243.35057,
  256.06308,
  268.5435,
  281.52606,
  295.01364,
  309.0672,
  323.6016,
  336.75754,
  350.5303,
  364.4827,
  378.61917,
  398.6004,
  416.39825,
  434.387,
  452.95105,
  472.60623,
  492.8849,
  513.56854,
  539.1032,
  565.51056,
  592.53876,
  624.4434,
  651.47015,
  679.4968,
  707.79407,
  736.67145,
  765.64026,
  794.7734,
  824.67737,
  851.1578,
  877.74207,
  914.2291,
  946.74677,
  979.4114,
  1011.223,
  1044.7917,
  1077.4437,
  1109.9976,
  1142.9766,
  1176.3695,
  1210.1844,
  1253.8357,
  1288.9528,
  1325.4841,
  1363.4569,
  1405.0974,
  1446.8535,
]
// PlayerShieldLevelCo
const cryLvlMultis = [
  NaN, // lvl 0
  91.1791,
  98.707664,
  106.23622,
  113.76477,
  121.29332,
  128.82188,
  136.35042,
  143.87898,
  151.40752,
  158.93608,
  169.99149,
  181.07625,
  192.19037,
  204.0482,
  215.939,
  227.86275,
  247.68594,
  267.5421,
  287.4312,
  303.82642,
  320.22522,
  336.62762,
  352.31927,
  368.01093,
  383.70255,
  394.43237,
  405.18146,
  415.94992,
  426.73764,
  437.5447,
  450.6,
  463.7003,
  476.84558,
  491.1275,
  502.55457,
  514.0121,
  531.4096,
  549.9796,
  568.5849,
  584.9965,
  605.67035,
  626.3862,
  646.0523,
  665.7556,
  685.4961,
  700.8394,
  723.3331,
  745.8653,
  768.4357,
  786.79193,
  809.5388,
  832.32904,
  855.16266,
  878.0396,
  899.4848,
  919.362,
  946.0396,
  974.7642,
  1003.5786,
  1030.077,
  1056.635,
  1085.2463,
  1113.9244,
  1149.2587,
  1178.0648,
  1200.2238,
  1227.6603,
  1257.243,
  1284.9174,
  1314.7529,
  1342.6652,
  1372.7524,
  1396.321,
  1427.3124,
  1458.3745,
  1482.3358,
  1511.9109,
  1541.5493,
  1569.1537,
  1596.8143,
  1622.4197,
  1648.074,
  1666.3761,
  1684.6782,
  1702.9803,
  1726.1047,
  1754.6715,
  1785.8666,
  1817.1375,
  1851.0603,
]

const {
  final: { eleMas },
  char: { lvl },
  reaction: { ampBase, cataBase, bonus },
} = self

function eleMasMulti(a: number, b: number): NumNode {
  return sum(percent(1), prod(a, sumfrac(eleMas, b)), bonus)
}

const _crystallizeHit = prod(
  subscript(lvl, cryLvlMultis),
  eleMasMulti(40 / 9, 1400)
)

type TransInfo = {
  multi: number
  canCrit: boolean
  triggeredBy: ElementWithPhyKey[]
  variants: ElementWithPhyKey[]
}
const transInfo: Record<TransformativeReactionKey, TransInfo> = {
  overloaded: {
    multi: 2,
    canCrit: false,
    triggeredBy: ['pyro'],
    variants: ['pyro'],
  },
  shattered: {
    multi: 1.5,
    canCrit: false,
    triggeredBy: ['physical'],
    variants: ['physical'],
  },
  electrocharged: {
    multi: 1.2,
    canCrit: false,
    triggeredBy: ['electro'],
    variants: ['electro'],
  },
  superconduct: {
    multi: 0.5,
    canCrit: false,
    triggeredBy: ['cryo'],
    variants: ['cryo'],
  },
  swirl: {
    multi: 0.6,
    canCrit: false,
    triggeredBy: ['anemo'],
    variants: ['pyro', 'hydro', 'electro', 'cryo'],
  },
  burning: {
    multi: 0.25,
    canCrit: true,
    triggeredBy: ['pyro', 'dendro'],
    variants: ['pyro'],
  },
  bloom: {
    multi: 2,
    canCrit: true,
    triggeredBy: ['dendro', 'hydro'],
    variants: ['dendro'],
  },
  burgeon: {
    multi: 3,
    canCrit: true,
    triggeredBy: ['pyro'],
    variants: ['dendro'],
  },
  hyperbloom: {
    multi: 3,
    canCrit: true,
    triggeredBy: ['electro'],
    variants: ['dendro'],
  },
}
const transTriggerByEle = Object.fromEntries(
  allElementWithPhyKeys.map((ele) => [ele, new Set()])
) as Record<ElementWithPhyKey, Set<TransformativeReactionKey>>
function trigger(
  ele: ElementWithPhyKey,
  trans: TransformativeReactionKey,
  immediateFromEle: Record<ElementWithPhyKey, Set<TransformativeReactionKey>>
) {
  if (transTriggerByEle[ele].has(trans)) return
  transTriggerByEle[ele].add(trans)

  for (const variant of transInfo[trans].variants)
    for (const trans of immediateFromEle[variant])
      trigger(ele, trans, immediateFromEle)
}
{
  const immediateFromEle = Object.fromEntries(
    allElementWithPhyKeys.map((ele) => [ele, new Set()])
  ) as Record<ElementWithPhyKey, Set<TransformativeReactionKey>>
  for (const trans of allTransformativeReactionKeys)
    for (const ele of transInfo[trans].triggeredBy)
      immediateFromEle[ele].add(trans)

  for (const ele of allElementWithPhyKeys)
    for (const trans of immediateFromEle[ele])
      trigger(ele, trans, immediateFromEle)
}

const data: TagMapNodeEntries = [
  selfBuff.reaction.ampBase.add(eleMasMulti(25 / 9, 1400)),
  selfBuff.reaction.ampMulti.melt.cryo.add(prod(1.5, ampBase)),
  selfBuff.reaction.ampMulti.melt.pyro.add(prod(2.0, ampBase)),
  selfBuff.reaction.ampMulti.vaporize.pyro.add(prod(1.5, ampBase)),
  selfBuff.reaction.ampMulti.vaporize.hydro.add(prod(2.0, ampBase)),

  selfBuff.reaction.cataBase.add(eleMasMulti(5, 1200)),
  selfBuff.reaction.cataAddi.spread.dendro.add(
    prod(subscript(self.char.lvl, transLvlMultis), 1.25, cataBase)
  ),
  selfBuff.reaction.cataAddi.aggravate.electro.add(
    prod(subscript(self.char.lvl, transLvlMultis), 1.15, cataBase)
  ),

  selfBuff.reaction.transBase.add(
    prod(subscript(lvl, transLvlMultis), eleMasMulti(16, 2000))
  ),
  selfBuff.trans.critMulti.add(
    lookup(self.common.critMode, {
      crit: sum(1, self.trans.cappedCritRate_),
      nonCrit: 1,
      avg: sum(1, prod(self.trans.cappedCritRate_, self.trans.critDMG_)),
    })
  ),
  ...allTransformativeReactionKeys.map((trans) =>
    selfBuff.trans.multi[trans].add(transInfo[trans].multi)
  ),

  // Trans listing
  ...allTransformativeReactionKeys.flatMap((trans) => {
    const { canCrit, variants } = transInfo[trans]
    const q = trans === 'swirl' ? 'swirl' : canCrit ? 'transCrit' : 'trans'
    let cond: string | StrNode = 'unique'
    const available = allElementKeys.filter((ele) =>
      transTriggerByEle[ele].has(trans)
    )
    if (
      !transTriggerByEle['physical'].has(trans) &&
      available.length !== allElementKeys.length
    )
      cond =
        available.length === 1
          ? cmpEq(self.char.ele, available[0], cond, '')
          : lookup(
              self.char.ele,
              Object.fromEntries(available.map((k) => [k, cond])),
              ''
            )
    return variants.flatMap((ele) => {
      const name = trans === 'swirl' ? `swirl_${ele}` : trans
      return [
        selfBuff.formula.listing.add(
          tag(cond, { trans, q, ele, src: 'static', name })
        ),
        selfBuff.prep.ele.name(name).add(ele),
      ]
    })
  }),
]

export default data
