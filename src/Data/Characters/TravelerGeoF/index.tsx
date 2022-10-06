import { CharacterKey, CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import assets from './assets'
import geo from './geo'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerGeoF"
const charKey: CharacterKey = "TravelerGeo"

export default travelerSheet(key, charKey, geo, skillParam_gen, assets, TravelerF.sheet)
