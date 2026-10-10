import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FavoniusGreatsword'

export default register(key, entriesForWeapon(key))
