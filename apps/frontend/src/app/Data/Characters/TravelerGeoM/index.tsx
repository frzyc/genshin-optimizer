import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import geo from '../TravelerGeoF/geo'
import TravelerM from '../TravelerM'

const key: CharacterSheetKey = 'TravelerGeoM'
const charKey: CharacterKey = 'TravelerGeo'

export default travelerSheet(key, charKey, geo, TravelerM.sheet)
