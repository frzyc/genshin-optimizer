import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import geo from './geo'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = 'TravelerGeoF'
const charKey: CharacterKey = 'TravelerGeo'

export default travelerSheet(key, charKey, geo, skillParam_gen, TravelerF.sheet)
