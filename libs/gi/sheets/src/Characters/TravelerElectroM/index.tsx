import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import electro from '../TravelerElectroF/electro'

const key: CharacterSheetKey = 'TravelerElectroM'
const charKey: CharacterKey = 'TravelerElectro'

export default travelerSheet(key, charKey, electro)
