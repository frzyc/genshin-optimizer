import type { CharacterKey } from '@genshin-optimizer/consts'
import type { CharacterSheetKey } from '../../../Types/consts'
import { travelerSheet } from '../Traveler'
import dendro from '../TravelerDendroF/dendro'
import TravelerM from '../TravelerM'

const key: CharacterSheetKey = 'TravelerDendroM'
const charKey: CharacterKey = 'TravelerDendro'

export default travelerSheet(key, charKey, dendro, TravelerM.sheet)
