import {
  charKeyToLocGenderedCharKey,
  type CharacterKey,
  type GenderKey,
  type LocationGenderedCharacterKey,
} from '@genshin-optimizer/gi/consts'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SillyContext } from '../Context'
import { Translate } from '../Translate'

export function CharacterName({
  characterKey,
  gender = 'F',
}: {
  characterKey: CharacterKey
  gender: GenderKey
}) {
  const { silly } = useContext(SillyContext)
  const cKey = charKeyToLocGenderedCharKey(characterKey, gender)

  const { i18n } = useTranslation('sillyWisher_charNames')
  return (
    <Translate
      ns={
        silly && i18n.exists(`sillyWisher_charNames:${cKey}`)
          ? 'sillyWisher_charNames'
          : 'charNames_gen'
      }
      key18={cKey}
    />
  )
}
export function CharacterConstellationName({
  characterKey,
  gender = 'F',
}: {
  characterKey: CharacterKey
  gender: GenderKey
}) {
  let cKey = characterKey as LocationGenderedCharacterKey
  if (characterKey.startsWith('Traveler')) cKey = `Traveler${gender}`
  return <Translate ns={`char_${cKey}_gen`} key18="constellationName" />
}
