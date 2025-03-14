import {
  allDiscRarityKeys,
  allDiscSetKeys,
  type DiscRarityKey,
  type DiscSetKey,
} from '@genshin-optimizer/zzz/consts'

export const setKeysByRarities = Object.fromEntries(
  allDiscRarityKeys.map((r) => [r, [] as DiscSetKey[]]),
) as Record<DiscRarityKey, DiscSetKey[]>
allDiscSetKeys.forEach((setKey) => {
  allDiscRarityKeys.slice(0, 1).forEach((rarity) => {
    setKeysByRarities[rarity]?.push(setKey)
  })
})
