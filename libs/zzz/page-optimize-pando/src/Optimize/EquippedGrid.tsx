'use client'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import { useContext } from 'react'

export function EquippedGrid({ onClick }: { onClick?: () => void }) {
  const character = useContext(CharacterContext)

  return (
    <EquipGrid
      discIds={character?.equippedDiscs}
      wengineId={character?.equippedWengine}
      onClick={onClick}
    />
  )
}
