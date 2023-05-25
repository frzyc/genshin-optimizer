import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import TravelerF from '../TravelerF'
import dendro from './dendro'

const key: CharacterSheetKey = 'TravelerDendroF'
const charKey: CharacterKey = 'TravelerDendro'

export default travelerSheet(key, charKey, dendro, TravelerF.sheet)
