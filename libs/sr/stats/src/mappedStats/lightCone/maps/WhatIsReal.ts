import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'WhatIsReal'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  healScaling: data_gen.superimpose.otherStats[o++],
  extraHeal: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
