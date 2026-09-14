import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SongOfBrokenPines'
const atkTeam_Src = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]
const atkSPD_Src = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]

const {
  weapon: { refinement },
} = own
const { RebelsBannerHymn } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.atkSPD_.add(
    RebelsBannerHymn.ifOn(percent(subscript(refinement, atkSPD_Src)))
  ),
  teamBuff.premod.atk_.addOnce(
    'millenialatk',
    RebelsBannerHymn.ifOn(percent(subscript(refinement, atkTeam_Src)))
  )
)
