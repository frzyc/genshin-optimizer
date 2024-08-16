import { allBoolConditionals } from '../util'

export const { enemyFrozen } = allBoolConditionals('static', 'both')
export const {
  hasShield,
  nearbyDendro1, // Burning, Quicken, Bloom
  nearbyDendro2, // Aggravate, Spread, Hyperbloom, Burgeon
} = allBoolConditionals('static', 'dst')
