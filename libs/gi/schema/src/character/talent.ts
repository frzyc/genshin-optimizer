import { clamp } from '@genshin-optimizer/common/util'
import { type AscensionKey, talentLimits } from '@genshin-optimizer/gi/consts'

export function validateTalent(
  ascension: AscensionKey,
  talent: unknown
): {
  auto: number
  skill: number
  burst: number
} {
  const talentMax = talentLimits[ascension]
  if (talent === null || typeof talent !== 'object') {
    return { auto: 1, skill: 1, burst: 1 }
  }
  const t = talent as { auto?: unknown; skill?: unknown; burst?: unknown }
  return {
    auto: clamp(typeof t.auto === 'number' ? t.auto : 1, 1, talentMax),
    skill: clamp(typeof t.skill === 'number' ? t.skill : 1, 1, talentMax),
    burst: clamp(typeof t.burst === 'number' ? t.burst : 1, 1, talentMax),
  }
}
