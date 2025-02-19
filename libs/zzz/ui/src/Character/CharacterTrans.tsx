'use client'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
// use client due to hydration difference between client rendering and server in translation
import { Translate } from '@genshin-optimizer/zzz/i18n'

export function CharacterName({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return <Translate ns="charNames_gen" key18={characterKey} />
}
