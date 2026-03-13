import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import type { IArtifact } from '@genshin-optimizer/gi/schema'
import { getSubstatValuesPercent } from './artifact'

type ArtifactInput = Partial<IArtifact> & Pick<IArtifact, 'level' | 'substats'>

/**
 * Builds a substat value from roll indices for artifact-focused tests.
 *
 * Passing `4` or `5` as the second argument selects that rarity explicitly.
 * Otherwise the second argument is treated as the first roll index and defaults to 5-star values.
 */
export function rollValue(
  key: SubstatKey,
  rarityOrIndex: 4 | 5 | number,
  ...restIndices: number[]
) {
  const [rarity, indices]: [4 | 5, number[]] =
    rarityOrIndex === 4 || rarityOrIndex === 5
      ? [rarityOrIndex, restIndices]
      : [5, [rarityOrIndex, ...restIndices]]
  const values = getSubstatValuesPercent(key, rarity)
  return indices.reduce((sum, index) => sum + values[index], 0)
}

/** Creates a minimal artifact fixture for artifact utility tests. */
export function makeArtifact(artifact: ArtifactInput): IArtifact
/** Creates a minimal artifact fixture with an `id` for filter-oriented tests. */
export function makeArtifact(
  artifact: ArtifactInput & { id: string }
): IArtifact & { id: string }
export function makeArtifact({
  id,
  rarity = 5,
  level,
  substats,
  setKey = 'GladiatorsFinale',
  slotKey = 'flower',
  mainStatKey = 'hp',
  location = '',
  lock = false,
  ...rest
}: ArtifactInput & { id?: string }) {
  const artifact: IArtifact = {
    setKey,
    slotKey,
    level,
    rarity,
    mainStatKey,
    location,
    lock,
    substats,
    ...rest,
  }
  return id ? { ...artifact, id } : artifact
}
