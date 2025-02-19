'use client'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { CharacterContextObj } from '@genshin-optimizer/zzz/db-ui'
import { CharacterContext, useCharacter } from '@genshin-optimizer/zzz/db-ui'
import { CardContent, Skeleton } from '@mui/material'
import { Suspense, useMemo } from 'react'
import { Content } from './Content'

export function CharacterEditor({
  characterKey,
  onClose,
}: {
  characterKey?: CharacterKey
  onClose: () => void
}) {
  return (
    <ModalWrapper open={!!characterKey} onClose={onClose}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && (
          <CharacterEditorContent
            key={characterKey}
            characterKey={characterKey}
            onClose={onClose}
          />
        )}
      </Suspense>
    </ModalWrapper>
  )
}

type CharacterDisplayCardProps = {
  characterKey: CharacterKey
  onClose?: () => void
}
function CharacterEditorContent({
  characterKey,
  onClose,
}: CharacterDisplayCardProps) {
  const character = useCharacter(characterKey)
  const characterContextValue: CharacterContextObj | undefined = useMemo(
    () =>
      character && {
        character,
      },
    [character]
  )

  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Suspense
          fallback={
            <Skeleton variant="rectangular" width="100%" height={1000} />
          }
        >
          {characterContextValue ? (
            <CharacterContext.Provider value={characterContextValue}>
              <Content onClose={onClose} />
            </CharacterContext.Provider>
          ) : (
            <Skeleton variant="rectangular" width="100%" height={1000} />
          )}
        </Suspense>
      </CardContent>
    </CardThemed>
  )
}
