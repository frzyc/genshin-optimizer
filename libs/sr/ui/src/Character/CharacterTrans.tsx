// use client due to hydration difference between client rendering and server in translation
import type { CharacterGenderedKey } from '@genshin-optimizer/sr/consts'
import { Translate } from '@genshin-optimizer/sr/i18n'

export function CharacterName({
  genderedKey,
}: {
  genderedKey: CharacterGenderedKey
}) {
  return <Translate ns="charNames_gen" key18={genderedKey} />
}
