import { constant, NumNode } from '@genshin-optimizer/waverider'
import { Source } from './listing'
import { reader } from './read'

export function percent(x: number | NumNode): NumNode {
  return typeof x === 'number' ? constant(x) : x
}

export function read(src: Source, r = reader) {
  const {
    self: { base, premod, final, char, weapon, common, dmg }, enemy: { enemy }, target: buffTarget, team
  } = r.with('src', 'agg')._withAll('et')
  const {
    self: { custom }, self: selfBuff,
    teamBuff, active: activeCharBuff,
    enemy: enemyDebuff,
  } = r.with('src', src)._withAll('et')

  return {
    input: { base, premod, final, char, weapon, common, dmg, enemy, buffTarget, team },
    custom,
    output: {
      selfBuff, teamBuff, activeCharBuff, enemyDebuff,
      dmgEntry(name: string) { return r.withTag({ name, src, qt: 'dmg', q: 'final' }) },
    },
  }
}
