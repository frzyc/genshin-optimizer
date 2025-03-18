import {
  type DiscRarityKey,
  type DiscSetKey,
  allDiscRarityKeys,
  allDiscSetKeys,
} from '@genshin-optimizer/zzz/consts'

export const setKeysByRarities = Object.fromEntries(
  allDiscRarityKeys.map((r) => [r, [] as DiscSetKey[]])
) as Record<DiscRarityKey, DiscSetKey[]>
for (const setKey of allDiscSetKeys) {
  for (const rarity of allDiscRarityKeys) {
    setKeysByRarities[rarity]?.push(setKey)
  }
}
