import { NextImage } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { styled } from '@mui/material/styles'
interface ImgIconProps {
  size?: number
  sideMargin?: boolean
}
const CharIconWrapper = styled(NextImage ? (NextImage as any) : 'img', {
  name: 'ImgIcon',
  slot: 'Root',
  shouldForwardProp: (pn) =>
    !['size', 'sideMargin'].includes(pn as 'size' | 'sideMargin'),
})<ImgIconProps>(({ size = 1.5 }) => ({
  display: 'inline-block',
  width: `${size}em`,
  height: `${size}em`,
  verticalAlign: 'text-bottom',
}))

export function CharIconCircle({
  characterKey,
}: {
  characterKey: CharacterKey
  sideMargin?: boolean
}) {
  const genshinAsset = characterAsset(characterKey, 'circle')

  return <CharIconWrapper src={genshinAsset} />
}
