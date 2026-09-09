import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WolfsGravestone'
const atkTeam_Src = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { WolfishTracker } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.atk_.addOnce(
    'wolf',
    WolfishTracker.ifOn(percent(subscript(refinement, atkTeam_Src)))
  )
)
