import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import electro from './electro'

const key: CharacterSheetKey = 'TravelerElectroF'
const charKey: CharacterKey = 'TravelerElectro'

export default travelerSheet(key, charKey, electro)
