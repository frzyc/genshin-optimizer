import { NextImage } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { styled } from '@mui/material/styles'
interface ImgIconProps {
  size?: number
}
const CharIconWrapper = styled(NextImage ? (NextImage as any) : 'img', {
  name: 'ImgIcon',
  slot: 'Root',
  shouldForwardProp: (pn: string) => !['size'].includes(pn),
})<ImgIconProps>(({ size = 1.5 }) => ({
  display: 'flex',
  width: `${size}em`,
  height: `${size}em`,
}))

export function CharIconCircle({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const charAsset = characterAsset(characterKey, 'circle')

  return <CharIconWrapper src={charAsset} />
}
