import { CharacterKey } from '@genshin-optimizer/consts'
import { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import dendro from '../TravelerDendroF/dendro'
import TravelerM from '../TravelerM'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerDendroM"
const charKey: CharacterKey = "TravelerDendro"

export default travelerSheet(key, charKey, dendro, skillParam_gen, TravelerM.sheet)
