import { objMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { useContext } from 'react'
import { EquipBuildModal } from '.'

type WrapperProps = {
  artIdOrSlot?: string | ArtifactSlotKey
  weaponId?: string
  onHide: () => void
  onEquip: () => void
}
export function CompareBuildWrapper(props: WrapperProps) {
  const teamCharacterContextObj = useContext(TeamCharacterContext)
  const characterContextObj = useContext(CharacterContext)
  if (teamCharacterContextObj?.teamChar?.optConfigId)
    return <TeamWrapper {...props} />
  else if (characterContextObj?.character)
    return <CharacterWrapper {...props} />
  return null
}
function TeamWrapper({ artIdOrSlot, weaponId, onHide, onEquip }: WrapperProps) {
  const database = useDatabase()
  const { loadoutDatum } = useContext(TeamCharacterContext)

  const newArt = database.arts.get(artIdOrSlot ?? '')
  const currentArtifactIds = database.teams.getCompareArtifactIds(loadoutDatum)
  const newArtifactIds = objMap(currentArtifactIds, (id, slot) =>
    slot === artIdOrSlot
      ? undefined
      : newArt?.slotKey === slot
      ? artIdOrSlot
      : id
  )
  const currentWeaponId = database.teams.getCompareWeaponId(loadoutDatum)
  const newWeaponId = weaponId ?? currentWeaponId
  return (
    <EquipBuildModal
      currentName={
        (loadoutDatum.compareType === 'real' &&
          database.builds.get(loadoutDatum.compareBuildId)?.name) ||
        'Equipped'
      }
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

function CharacterWrapper({
  artIdOrSlot,
  weaponId,
  onHide,
  onEquip,
}: WrapperProps) {
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
    <EquipBuildModal
      currentName={'Equipped'}
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
