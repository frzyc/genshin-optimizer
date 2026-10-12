import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import cryo from '../TravelerCryoF/cryo'

const key: CharacterSheetKey = 'TravelerCryoM'
const charKey: CharacterKey = 'TravelerCryo'

export default travelerSheet(key, charKey, cryo)
