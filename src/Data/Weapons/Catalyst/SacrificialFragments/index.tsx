import { WeaponData } from 'pipeline'
import { IConditionals } from '../../../../Types/IConditional'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import img from './Weapon_Sacrificial_Fragments.png'

const refinementVals = [40, 50, 60, 70, 80]
const refinementCdVals = [30, 26, 22, 19, 16]
const conditionals: IConditionals = {
  c: {
    name: "After Elemental Skill",
    maxStack: 1,
    stats: () => ({
      cdRed_: 100
    })
  }
}
const weapon: IWeaponSheet = {
  ...data_gen as unknown as WeaponData,
  img,
  conditionals
}
export default weapon