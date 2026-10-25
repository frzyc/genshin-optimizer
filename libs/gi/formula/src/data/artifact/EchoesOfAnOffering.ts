import { range } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, lookup, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent } from '../util'
import { artCount, registerArt } from './util'

const key: ArtifactSetKey = 'EchoesOfAnOffering',
  count = artCount(key)
const triggerArr = range(0.3, 0.5, 0.025)
const modeKeys = ['on', 'avg', ...triggerArr.map((c) => String(c))]
const { mode } = allListConditionals(key, modeKeys)
const modeTable = {
  on: percent(0.7),
  avg: percent(0.7 * 0.50204),
  ...Object.fromEntries(triggerArr.map((c) => [String(c), percent(0.7 * c)])),
}

export default registerArt(
  key,
  ownBuff.premod.atk_.add(cmpGE(count, 2, percent(0.18))),
  ownBuff.formula.base.normal.add(
    cmpGE(
      count,
      4,
      prod(
        lookup(subscript(mode.value, ['', ...modeKeys]), modeTable, 0),
        own.final.atk
      )
    )
  )
)
