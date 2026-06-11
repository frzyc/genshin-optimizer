import { CharacterContext } from '@genshin-optimizer/zzz/db-ui'
import { EquipGrid } from '@genshin-optimizer/zzz/ui'
import { useContext } from 'react'
const columns = { xs: 2, sm: 1, md: 2, lg: 3, xl: 4 } as const
export function EquippedGrid({ onClick }: { onClick?: () => void }) {
  const character = useContext(CharacterContext)

  return (
    <EquipGrid
      discIds={character?.equippedDiscs}
      wengineId={character?.equippedWengine}
      onClick={onClick}
      columns={columns}
    />
  )
}
