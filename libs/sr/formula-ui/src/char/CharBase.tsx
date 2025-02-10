import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { ElementalTypeKey } from '@genshin-optimizer/sr/consts'
import {
  allElementalDmgMainStatKeys,
  allStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { StatDisplay } from '@genshin-optimizer/sr/ui'
export const charBaseUiSheet: TagField[] = allStatKeys.map((statKey) => {
  if (
    allElementalDmgMainStatKeys.includes(
      statKey as (typeof allElementalDmgMainStatKeys)[number]
    )
  ) {
    const tag = {
      ...own.final.dmg_.tag,
      elementalType: statKey.slice(0, -5) as ElementalTypeKey,
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
