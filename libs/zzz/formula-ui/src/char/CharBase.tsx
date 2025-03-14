import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import { allAttributeDamageKeys } from '@genshin-optimizer/zzz/consts'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
export const charBaseUiSheet: TagField[] = (
  [
    'crit_',
    'crit_dmg_',
    'hp',
    'atk',
    'def',
    'impact',
    'pen',
    'pen_',
    'enerRegen',
    'anomProf',
    'anomMas',
    'dmg_',
  ] as const
).map((statKey) => {
  if (
    allAttributeDamageKeys.includes(
      statKey as (typeof allAttributeDamageKeys)[number],
    )
  ) {
    const tag = {
      ...own.final.dmg_.tag,
      attribute: statKey.slice(0, -5) as Attribute,
    } as Tag
    return {
      title: <StatDisplay statKey={statKey} />,
      fieldRef: tag,
    } as TagField
  }
  if (statKey === 'crit_')
    return {
      fieldRef: own.common.cappedCrit_.tag,
      title: <StatDisplay statKey={statKey} />,
    }
  return {
    fieldRef: own.final[statKey as keyof typeof own.final].tag as Tag,
    title: <StatDisplay statKey={statKey} />,
  }
})
