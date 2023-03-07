import { CharacterKey } from '@genshin-optimizer/consts'
import { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import electro from '../TravelerElectroF/electro'
import TravelerM from '../TravelerM'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerElectroM"
const charKey: CharacterKey = "TravelerElectro"

export default travelerSheet(key, charKey, electro, skillParam_gen, TravelerM.sheet)
