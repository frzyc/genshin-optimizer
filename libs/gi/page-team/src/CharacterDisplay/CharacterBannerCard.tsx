import { CardThemed } from '@genshin-optimizer/common/ui'
import { characterAsset } from '@genshin-optimizer/gi/assets'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import type { ReactNode } from 'react'

export function CharacterBannerCard({
  characterKey,
  elementKey,
  children,
}: {
  characterKey: CharacterKey
  elementKey: ElementKey
  children: ReactNode
}) {
  const { gender } = useDBMeta()
  const banner = characterAsset(characterKey, 'banner', gender)

  return (
    <CardThemed
      sx={(theme) => ({
        position: 'relative',
        boxShadow: elementKey
          ? `0px 0px 0px 1px ${theme.palette[elementKey].main} inset`
          : undefined,
        '&::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.3,
          backgroundImage: `url(${banner})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        },
        '& > *': {
          position: 'relative',
          zIndex: 1,
        },
      })}
    >
      {children}
    </CardThemed>
  )
}
