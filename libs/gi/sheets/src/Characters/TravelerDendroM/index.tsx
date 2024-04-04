import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import dendro from '../TravelerDendroF/dendro'

const key: CharacterSheetKey = 'TravelerDendroM'
const charKey: CharacterKey = 'TravelerDendro'

export default travelerSheet(key, charKey, dendro)
