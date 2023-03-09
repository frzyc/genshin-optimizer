import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import anemo from './anemo'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = 'TravelerAnemoF'
const charKey: CharacterKey = 'TravelerAnemo'

export default travelerSheet(
  key,
  charKey,
  anemo,
  skillParam_gen,
  TravelerF.sheet
)
