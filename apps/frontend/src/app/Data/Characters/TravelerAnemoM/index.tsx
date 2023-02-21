import { CharacterKey } from '@genshin-optimizer/consts'
import { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import anemo from '../TravelerAnemoF/anemo'
import TravelerM from '../TravelerM'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = "TravelerAnemoM"
const charKey: CharacterKey = "TravelerAnemo"

export default travelerSheet(key, charKey, anemo, skillParam_gen, TravelerM.sheet)
