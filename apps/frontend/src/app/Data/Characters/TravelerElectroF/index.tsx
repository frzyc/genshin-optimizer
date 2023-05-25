import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import electro from './electro'

const key: CharacterSheetKey = 'TravelerElectroF'
const charKey: CharacterKey = 'TravelerElectro'

export default travelerSheet(key, charKey, electro, TravelerF.sheet)
