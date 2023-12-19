import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import hydro from '../TravelerHydroF/hydro'
import TravelerM from '../TravelerM'

const key: CharacterSheetKey = 'TravelerHydroM'
const charKey: CharacterKey = 'TravelerHydro'

export default travelerSheet(key, charKey, hydro, TravelerM.sheet)
