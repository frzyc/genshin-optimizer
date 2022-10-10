import { CharacterKey, CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import geo from '../TravelerGeoF/geo'
import TravelerM from '../TravelerM'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerGeoM"
const charKey: CharacterKey = "TravelerGeo"

export default travelerSheet(key, charKey, geo, skillParam_gen, assets, TravelerM.sheet)
