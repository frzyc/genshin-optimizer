import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import electro from '../TravelerElectroF/electro'
import TravelerM from '../TravelerM'

const key: CharacterSheetKey = 'TravelerElectroM'
const charKey: CharacterKey = 'TravelerElectro'

export default travelerSheet(key, charKey, electro, TravelerM.sheet)
