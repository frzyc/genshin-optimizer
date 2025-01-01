import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import pyro from '../TravelerPyroF/pyro'

const key: CharacterSheetKey = 'TravelerPyroM'
const charKey: CharacterKey = 'TravelerPyro'

export default travelerSheet(key, charKey, pyro)
