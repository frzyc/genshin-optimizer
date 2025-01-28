import { NextImage } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { portrait } from '@genshin-optimizer/gi/silly-wisher'
import { styled } from '@mui/material/styles'
import { useContext } from 'react'
import { SillyContext } from '../context'
interface ImgIconProps {
  size?: number
  sideMargin?: boolean
}
/**
 * Genshin side icons are not very well cropped, so we have to manually apply margin to get it to look pretty.
 */
const CharIconSideWrapper = styled(NextImage ? (NextImage as any) : 'img', {
  name: 'ImgIcon',
  slot: 'Root',
  shouldForwardProp: (pn) =>
    !['size', 'sideMargin'].includes(pn as 'size' | 'sideMargin'),
})<ImgIconProps>(({ size = 3, sideMargin = false }) => ({
  display: 'inline-block',
  width: `${size}em`,
  height: `${size}em`,
  marginTop: `${0.85 * (1 - size)}em`,
  marginBottom: `${0.15 * (1 - size)}em`,
  marginLeft: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
  marginRight: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
  verticalAlign: 'text-bottom',
}))

/**
 * Silly wisher side icons are just front icons, and they are much more sensibly sized.
 */
const SillyCharIconSideWrapper = styled(
  NextImage ? (NextImage as any) : 'img',
  {
    name: 'ImgIcon',
    slot: 'Root',
    shouldForwardProp: (pn) =>
      !['size', 'sideMargin'].includes(pn as 'size' | 'sideMargin'),
  }
)<ImgIconProps>(({ size = 2, sideMargin = false }) => ({
  display: 'inline-block',
  width: `${size}em`,
  height: `${size}em`,
  marginTop: `${0.5 * (1 - size)}em`,
  marginBottom: `${0.5 * (1 - size)}em`,
  marginLeft: sideMargin ? undefined : `${0.5 * (1 - size)}em`,
  marginRight: sideMargin ? undefined : `${0.5 * (1 - size)}em`,
  verticalAlign: 'text-bottom',
}))

export function CharIconSide({
  characterKey,
  sideMargin = false,
}: {
  characterKey: CharacterKey
  sideMargin?: boolean
}) {
  const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)

  const sillyAsset = portrait(characterKey, gender)
  const genshinAsset = characterAsset(characterKey, 'iconSide', gender)

  if (silly && sillyAsset)
    return <SillyCharIconSideWrapper src={sillyAsset} sideMargin={sideMargin} />
  return <CharIconSideWrapper src={genshinAsset} sideMargin={sideMargin} />
}
