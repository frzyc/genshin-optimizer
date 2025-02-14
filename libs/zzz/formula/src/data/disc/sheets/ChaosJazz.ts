import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import { allBoolConditionals, own, registerBuff } from '../../util'
import { registerDisc } from '../util'

const key: DiscSetKey = 'ChaosJazz'

const discCount = own.common.count.sheet(key)

const { while_off_field } = allBoolConditionals(key)

const sheet = registerDisc(
  key,
  registerBuff(
    'set4_passive_fire_dmg_',
    own.combat.dmg_.fire.add(cmpGE(discCount, 4, 0.15))
  ),
  registerBuff(
    'set4_passive_electric_dmg_',
    own.combat.dmg_.electric.add(cmpGE(discCount, 4, 0.15))
  ),
  // Conditional buffs
  registerBuff(
    'set4_off_field_special_dmg_',
    own.combat.dmg_.addWithDmgType(
      'special',
      cmpGE(discCount, 4, while_off_field.ifOn(0.2))
    )
  ),
  registerBuff(
    'set4_off_field_assist_dmg_',
    own.combat.dmg_.addWithDmgType(
      'assist',
      cmpGE(discCount, 4, while_off_field.ifOn(0.2))
    )
  )
)
export default sheet
