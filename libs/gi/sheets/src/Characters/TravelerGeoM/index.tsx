import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import geo from '../TravelerGeoF/geo'

const key: CharacterSheetKey = 'TravelerGeoM'
const charKey: CharacterKey = 'TravelerGeo'

export default travelerSheet(key, charKey, geo)
