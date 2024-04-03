import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import anemo from '../TravelerAnemoF/anemo'

const key: CharacterSheetKey = 'TravelerAnemoM'
const charKey: CharacterKey = 'TravelerAnemo'

export default travelerSheet(key, charKey, anemo)
