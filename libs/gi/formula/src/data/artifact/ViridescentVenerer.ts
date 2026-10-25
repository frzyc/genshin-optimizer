import {
  type ArtifactSetKey,
  absorbableEle,
} from '@genshin-optimizer/gi/consts'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, enemyDebuff, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'ViridescentVenerer'
const count = artCount(key)
const { swirlpyro, swirlhydro, swirlcryo, swirlelectro } =
  allBoolConditionals(key)

const swirlShred = {
  pyro: swirlpyro,
  hydro: swirlhydro,
  cryo: swirlcryo,
  electro: swirlelectro,
} as const

export default registerArt(
  key,
  ownBuff.premod.dmg_.anemo.add(cmpGE(count, 2, percent(0.15))),
  ownBuff.premod.dmg_.swirl.add(cmpGE(count, 4, percent(0.6))),
  ownBuff.premod.dmg_.stellarswirl.add(cmpGE(count, 4, percent(0.2))),
  ...absorbableEle.flatMap((ele) =>
    enemyDebuff.common.preRes[ele].addOnce(
      key,
      swirlShred[ele].ifOn(cmpGE(count, 4, percent(-0.4)))
    )
  )
)
