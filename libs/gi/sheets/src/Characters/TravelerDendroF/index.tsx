import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import dendro from './dendro'

const key: CharacterSheetKey = 'TravelerDendroF'
const charKey: CharacterKey = 'TravelerDendro'

export default travelerSheet(key, charKey, dendro)
