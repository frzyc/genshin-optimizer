'use client'
import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import { useContext } from 'react'

const columns = {
  xs: 2,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4,
} as const

export function EquippedGrid({ onClick }: { onClick?: () => void }) {
  const character = useContext(CharacterContext)

  return (
    <EquipGrid
      discIds={character?.equippedDiscs}
      wengineId={character?.equippedWengine}
      columns={columns}
      onClick={onClick}
    />
  )
}
