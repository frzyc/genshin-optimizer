import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
export const charBaseUiSheet: TagField[] = // TODO: allPandoStatKeys
  (['crit_', 'crit_dmg_', 'hp', 'atk', 'def'] as const).map((statKey) => {
    // if (
    //   allElementalDmgMainStatKeys.includes(
    //     statKey as (typeof allElementalDmgMainStatKeys)[number]
    //   )
    // ) {
    //   const tag = {
    //     ...own.final.dmg_.tag,
    //     elementalType: statKey.slice(0, -5) as AttributeKey,
    //   } as Tag
    //   return {
    //     title: <StatDisplay statKey={statKey} />,
    //     fieldRef: tag,
    //   } as TagField
    // }
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
