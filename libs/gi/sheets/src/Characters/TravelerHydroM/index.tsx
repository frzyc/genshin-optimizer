import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import hydro from '../TravelerHydroF/hydro'
import TravelerM from '../TravelerM'

const key: CharacterSheetKey = 'TravelerHydroM'
const charKey: CharacterKey = 'TravelerHydro'

export default travelerSheet(key, charKey, hydro, TravelerM.sheet)
