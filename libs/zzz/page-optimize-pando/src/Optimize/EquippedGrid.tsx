'use client'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { CharacterEditor, EquipRow } from '@genshin-optimizer/zzz/ui'
import { Suspense, useCallback, useContext, useState } from 'react'

const columns = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 2,
  xl: 3,
} as const

export function OptimizeEquippedGrid() {
  const character = useContext(CharacterContext)
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )

  const onClick = useCallback(() => {
    character?.key && setCharacterKey(character.key)
  }, [character])
  return (
    <>
      <Suspense fallback={false}>
        <CharacterEditor
          characterKey={editorKey}
          onClose={() => setCharacterKey(undefined)}
        />
      </Suspense>
      <EquipRow
        discIds={character?.equippedDiscs}
        wengineId={character?.equippedWengine}
        columns={columns}
        onClick={onClick}
        spacing={2.5}
      />
    </>
  )
}
