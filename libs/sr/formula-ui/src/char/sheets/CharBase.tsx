import type { TagField } from '@genshin-optimizer/pando/ui-sheet'
import type { ElementalTypeKey } from '@genshin-optimizer/sr/consts'
import {
  allElementalDmgMainStatKeys,
  allRelicMainSubStatKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'
import { own } from '@genshin-optimizer/sr/formula'
import { RelicStatWithUnit } from '@genshin-optimizer/sr/ui'

export const charBaseUiSheet: TagField[] = allRelicMainSubStatKeys.map(
  (statKey) => {
    if (
      allElementalDmgMainStatKeys.includes(
        statKey as (typeof allElementalDmgMainStatKeys)[number]
      )
    ) {
      const tag = {
        ...own.final.dmg_,
        elementalType: statKey.slice(0, -5) as ElementalTypeKey,
      } as Tag
      return {
        title: <RelicStatWithUnit statKey={statKey} />,
        fieldRef: tag,
      } as TagField
    }
    console.log({ statKey })
    return {
      fieldRef: own.final[statKey as keyof typeof own.final].tag as Tag,
      title: <RelicStatWithUnit statKey={statKey} />,
    }
  }
)
