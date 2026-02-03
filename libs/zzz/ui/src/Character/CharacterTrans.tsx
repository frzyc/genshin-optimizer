import {
  type AttributeKey,
  type CharacterKey,
  elementalData,
} from '@genshin-optimizer/zzz/consts'
// use client due to hydration difference between client rendering and server in translation
import { Translate } from '@genshin-optimizer/zzz/i18n'
import { useTranslation } from 'react-i18next'

export function CharacterName({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return <Translate ns="charNames_gen" key18={characterKey} />
}

export function AttributeName({ attribute }: { attribute: AttributeKey }) {
  const { t } = useTranslation('statKey_gen')
  return <>{t(attribute)}</>
}
