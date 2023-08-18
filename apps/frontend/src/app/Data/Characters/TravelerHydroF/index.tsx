import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import hydro from './hydro'

const key: CharacterSheetKey = 'TravelerHydroF'
const charKey: CharacterKey = 'TravelerHydro'

export default travelerSheet(key, charKey, hydro, TravelerF.sheet)
