'use client'
// use client due to hydration difference between client rendering and server in translation
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { Translate } from '@genshin-optimizer/sr/i18n'

export function CharacterName({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  return <Translate ns="charNames_gen" key18={characterKey} />
}
