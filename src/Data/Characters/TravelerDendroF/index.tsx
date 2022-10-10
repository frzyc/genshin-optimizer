import { CharacterKey, CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import assets from './assets'
import dendro from './dendro'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerDendroF"
const charKey: CharacterKey = "TravelerDendro"

export default travelerSheet(key, charKey, dendro, skillParam_gen, assets, TravelerF.sheet)
