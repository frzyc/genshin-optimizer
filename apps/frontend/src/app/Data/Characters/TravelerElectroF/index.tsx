import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import electro from './electro'
import skillParam_gen from './skillParam_gen.json'

const key: CharacterSheetKey = 'TravelerElectroF'
const charKey: CharacterKey = 'TravelerElectro'

export default travelerSheet(
  key,
  charKey,
  electro,
  skillParam_gen,
  TravelerF.sheet
)
