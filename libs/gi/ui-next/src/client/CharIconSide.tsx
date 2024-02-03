import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import { portrait } from '@genshin-optimizer/gi/silly-wisher'
import { Box } from '@mui/material'
import Image from 'next/image'
import { useContext } from 'react'
import { SillyContext } from './SillyContext'
import { assetWrapper } from './util'

export function CharIconSide({
  characterKey,
  sideMargin = false,
}: {
  characterKey: CharacterKey
  sideMargin?: boolean
}) {
  const gender: GenderKey = 'F' //TODO: const { gender } = useDBMeta()
  const { silly } = useContext(SillyContext)

  const sillyAsset = portrait(characterKey, gender)
  const genshinAsset = characterAsset(characterKey, 'iconSide', gender)

  if (silly && sillyAsset) {
    /**
     * Silly wisher side icons are just front icons, and they are much more sensibly sized.
     */
    const size = 2
    return (
      <Box
        sx={{
          display: 'inline-block',
          width: `${size}em`,
          height: `${size}em`,
          marginTop: `${0.5 * (1 - size)}em`,
          marginBottom: `${0.5 * (1 - size)}em`,
          marginLeft: sideMargin ? undefined : `${0.5 * (1 - size)}em`,
          marginRight: sideMargin ? undefined : `${0.5 * (1 - size)}em`,
          verticalAlign: 'text-bottom',
          position: 'relative',
        }}
      >
        <Image
          src={assetWrapper(sillyAsset)}
          fill
          alt="" //TODO:
          style={{
            objectFit: 'contain',
          }}
        />
      </Box>
    )
  }
  /**
   * Genshin side icons are not very well cropped, so we have to manually apply margin to get it to look pretty.
   */
  const size = 3
  return (
    <Box
      sx={{
        display: 'inline-block',
        width: `${size}em`,
        height: `${size}em`,
        marginTop: `${0.85 * (1 - size)}em`,
        marginBottom: `${0.15 * (1 - size)}em`,
        marginLeft: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
        marginRight: sideMargin ? undefined : `${0.3 * (1 - size)}em`,
        verticalAlign: 'text-bottom',
        position: 'relative',
      }}
    >
      <Image
        src={assetWrapper(genshinAsset)}
        fill
        alt="" //TODO:
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
  )
}
