import { CardThemed, ConditionalWrapper } from '@genshin-optimizer/common/ui'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { Box, CardActionArea, Skeleton } from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useCallback } from 'react'
import { CharacterCardContent, CharacterCardEquipment } from './card'

export function CharacterCard({
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey
  onClick?: (characterKey: CharacterKey) => void
}) {
  const character = useCharacter(characterKey)
  const onClickHandler = useCallback(
    () => characterKey && onClick?.(characterKey),
    [characterKey, onClick]
  )
  const actionWrapperFunc = useCallback(
    (children: ReactNode) => (
      <CardActionArea
        onClick={onClickHandler}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </CardActionArea>
    ),
    [onClickHandler]
  )

  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={300} />}
    >
      <CardThemed
        bgt="light"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
        }}
      >
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          {character && (
            <ExistingCharacterCardContent characterKey={characterKey} />
          )}
        </ConditionalWrapper>
      </CardThemed>
    </Suspense>
  )
}

type ExistingCharacterCardContentProps = {
  characterKey: CharacterKey
}
function ExistingCharacterCardContent({
  characterKey,
}: ExistingCharacterCardContentProps) {
  const charStat = getCharStat(characterKey)
  return (
    <CardThemed sx={{ borderRadius: '20px', width: '100%' }}>
      <Box
        sx={(theme) => ({
          p: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          position: 'relative',
          background: `${theme.palette[charStat.attribute].main}`,
          height: '270px',
          padding: 0,
        })}
      >
        <CharacterCardEquipment characterKey={characterKey} />
      </Box>
      <Box
        sx={(_) => ({
          padding: '8px 8px 8px 20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexGrow: 1,
          position: 'relative',
          background: '#1A263A',
        })}
      >
        <CharacterCardContent characterKey={characterKey} />
      </Box>
    </CardThemed>
  )
}
