import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Dodoco_Tales.png'
const cdmg_ = [16, 20, 24, 28, 32]
const atk_ = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  a: {
    name: <Translate ns="sheet" key18="hitOp.normal" />,
    stats: stats => ({
      charged_dmg_: cdmg_[stats.weapon.refineIndex],
    })
  },
  c: {
    name: <Translate ns="sheet" key18="hitOp.charged" />,
    stats: stats => ({
      atk_: atk_[stats.weapon.refineIndex],
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  img,
  conditionals,
  document: [{
    conditional: conditionals.a
  }, {
    conditional: conditionals.c
  }],
}
export default weapon