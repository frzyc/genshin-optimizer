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
  artId?: string | ArtifactSlotKey
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
function TeamWrapper({ artId, weaponId, onHide, onEquip }: WrapperProps) {
  const database = useDatabase()
  const { loadoutDatum } = useContext(TeamCharacterContext)

  const newArt = database.arts.get(artId ?? '')
  const currentArtifactIds = database.teams.getLoadoutArtifactIds(loadoutDatum)
  const newArtifactIds = objMap(currentArtifactIds, (id, slot) =>
    slot === artId ? undefined : newArt?.slotKey === slot ? artId : id
  )
  const currentWeaponId = database.teams.getLoadoutWeaponId(loadoutDatum)
  const newWeaponId = weaponId ?? currentWeaponId
  return (
    <EquipBuildModal
      currentName={
        (loadoutDatum.buildType === 'real' &&
          database.builds.get(loadoutDatum.buildId)?.name) ||
        'Equipped'
      }
      newWeaponId={newWeaponId}
      currentWeaponId={currentWeaponId}
      newArtifactIds={newArtifactIds}
      currentArtifactIds={currentArtifactIds}
      show={!!(artId || weaponId)}
      onHide={onHide}
      onEquip={onEquip}
    />
  )
}

function CharacterWrapper({ artId, weaponId, onHide, onEquip }: WrapperProps) {
  const database = useDatabase()
  const {
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const newArt = database.arts.get(artId ?? '')
  const currentArtifactIds = equippedArtifacts
  const newArtifactIds = objMap(currentArtifactIds, (art, slot) => {
    if (newArt === undefined) {
      // If newArt is undefined, return an object with only the matching slotKey
      return (slot === artId) ? artId : art;
    }

    // Otherwise, use the existing logic
    return slot === newArt.slotKey ? artId : art;
  });


  console.log(newArtifactIds);

  const currentWeaponId = equippedWeapon
  const newWeaponId = weaponId ?? currentWeaponId

  return (
    <EquipBuildModal
      currentName={'Equipped'}
      newWeaponId={newWeaponId}
      currentWeaponId={currentWeaponId}
      newArtifactIds={newArtifactIds}
      currentArtifactIds={currentArtifactIds}
      show={!!(artId || weaponId)}
      onHide={onHide}
      onEquip={onEquip}
    />
  )
}
