import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { TalentSheetElementKey } from './consts'
import { talentSheetElement } from './util'

/** Shared talent/constellation icon + i18n name for mechanics cards and opt categories. */
export function TalentSheetElementHeading({
  characterKey,
  talentKey,
  iconSize = 1.25,
}: {
  characterKey: CharacterKey
  talentKey: TalentSheetElementKey
  iconSize?: number
}) {
  const { img, title } = talentSheetElement(characterKey, talentKey)
  return (
    <>
      {img && <ImgIcon src={img} size={iconSize} />}
      {title}
    </>
  )
}
