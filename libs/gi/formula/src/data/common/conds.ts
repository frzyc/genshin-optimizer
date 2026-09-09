import { allBoolConditionals, reader } from '../util'

export const { enemyFrozen } = allBoolConditionals('static', 'both')
export const { hasShield } = allBoolConditionals('static', 'dst')
/** Dest-ignored, src-scoped. Injected from `pandoContextEntries` (solo = that member). */
export const { isActive } = allBoolConditionals('dyn', 'dst')

/** `isActive` of the buff destination (active teammate), not the wielder. */
export const destIsActive = reader.max.withTag({
  et: 'target',
  sheet: 'dyn',
  qt: 'cond',
  q: 'isActive',
  src: null,
  name: null,
  region: null,
  ele: null,
  move: null,
  trans: null,
  amp: null,
  cata: null,
})
