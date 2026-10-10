import { objMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { CharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { useContext } from 'react'
import { PandoEquipBuildModal } from './PandoEquipBuildModal'

/** Character-equipped compare for Pando; production WR teams stay in gi/ui. */
export function PandoCompareBuildWrapper({
  artIdOrSlot,
  weaponId,
  onHide,
  onEquip,
}: {
  artIdOrSlot?: string | ArtifactSlotKey
  weaponId?: string
  onHide: () => void
  onEquip: () => void
}) {
  const database = useDatabase()
  const {
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const newArt = database.arts.get(artIdOrSlot ?? '')
  const currentArtifactIds = equippedArtifacts
  const newArtifactIds = objMap(currentArtifactIds, (art, slot) =>
    slot === artIdOrSlot
      ? undefined
      : newArt?.slotKey === slot
        ? artIdOrSlot
        : art
  )
  const currentWeaponId = equippedWeapon
  const newWeaponId = weaponId ?? currentWeaponId

  return (
    <PandoEquipBuildModal
      currentName="Equipped"
      newWeaponId={newWeaponId}
      currentWeaponId={currentWeaponId}
      newArtifactIds={newArtifactIds}
      currentArtifactIds={currentArtifactIds}
      show={!!(artIdOrSlot || weaponId)}
      onHide={onHide}
      onEquip={onEquip}
    />
  )
}
