import { CharacterKey, CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import electro from '../TravelerElectroF/electro'
import TravelerM from '../TravelerM'
import assets from './assets'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerElectroM"
const charKey: CharacterKey = "TravelerElectro"

export default travelerSheet(key, charKey, electro, skillParam_gen, assets, TravelerM.sheet)
