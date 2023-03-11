import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import geo from '../TravelerGeoF/geo'
import TravelerM from '../TravelerM'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = 'TravelerGeoM'
const charKey: CharacterKey = 'TravelerGeo'

export default travelerSheet(key, charKey, geo, skillParam_gen, TravelerM.sheet)
