import { customStringRead } from '@genshin-optimizer/gi/wr'

export const condPolestarStacksPath = ['reaction', 'polestarStacks']
export const condPolestarStacks = customStringRead([
  'conditional',
  ...condPolestarStacksPath,
])
export const condStellarRadiancePath = ['reaction', 'stellarRadiance']
export const condStellarRadiance = customStringRead([
  'conditional',
  ...condStellarRadiancePath,
])
