import { CharacterData } from 'pipeline'
import { WeaponTypeKey } from '../../../Types/consts'
import data_gen_src from './data_gen.json'
const data_gen = data_gen_src as CharacterData

export default {
  sheet: {
    rarity: data_gen.star,
    weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  },
  data_gen,
} as const
