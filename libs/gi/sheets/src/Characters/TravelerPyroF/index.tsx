import type {
  CharacterKey,
  CharacterSheetKey,
} from '@genshin-optimizer/gi/consts'
import { travelerSheet } from '../Traveler'
import pyro from './pyro'

const key: CharacterSheetKey = 'TravelerPyroF'
const charKey: CharacterKey = 'TravelerPyro'

export default travelerSheet(key, charKey, pyro)
