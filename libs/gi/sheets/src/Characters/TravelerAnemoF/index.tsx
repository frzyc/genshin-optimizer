import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import anemo from './anemo'

const key: CharacterSheetKey = 'TravelerAnemoF'
const charKey: CharacterKey = 'TravelerAnemo'

export default travelerSheet(key, charKey, anemo)
