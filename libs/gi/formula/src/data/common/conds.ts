import { allBoolConditionals } from '../util'

export const { enemyFrozen } = allBoolConditionals('static', 'both')
export const { hasShield } = allBoolConditionals('static', 'dst')
/** Dest-ignored, src-scoped. Injected from `PandoTeam.activeMember`. */
export const { isActive } = allBoolConditionals('dyn', 'dst')
