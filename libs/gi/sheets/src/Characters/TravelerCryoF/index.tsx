import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import cryo from './cryo'

const key: CharacterSheetKey = 'TravelerCryoF'
const charKey: CharacterKey = 'TravelerCryo'

export default travelerSheet(key, charKey, cryo)
