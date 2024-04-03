import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import geo from './geo'

const key: CharacterSheetKey = 'TravelerGeoF'
const charKey: CharacterKey = 'TravelerGeo'

export default travelerSheet(key, charKey, geo)
