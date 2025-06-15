import { objKeyMap } from '@genshin-optimizer/common/util'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { useMemo } from 'react'
import { useArtifact } from './useArtifact'

const emptyArtIds = objKeyMap(allArtifactSlotKeys, () => undefined)

/**
 * A hook to keep a "build" of artifacts in sync with the database
 */
export function useArtifacts(
  relicIds:
    | Record<ArtifactSlotKey, string | undefined>
    | undefined = emptyArtIds
) {
  const flower = useArtifact(relicIds.flower)
  const plume = useArtifact(relicIds.plume)
  const sands = useArtifact(relicIds.sands)
  const goblet = useArtifact(relicIds.goblet)
  const circlet = useArtifact(relicIds.circlet)
  return useMemo(() => {
    return {
      flower,
      plume,
      sands,
      goblet,
      circlet,
    }
  }, [flower, plume, sands, goblet, circlet])
}
