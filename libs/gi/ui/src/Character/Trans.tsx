import type {
  CharacterKey,
  GenderKey,
  LocationGenderedCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '../Translate'

export function CharacterName({
  characterKey,
  gender = 'F',
}: {
  characterKey: CharacterKey
  gender: GenderKey
}) {
  let cKey = characterKey as LocationGenderedCharacterKey
  if (characterKey.startsWith('Traveler')) cKey = `Traveler${gender}`
  return <Translate ns="charNames_gen" key18={cKey} />
}
