import { ColorText } from '@genshin-optimizer/common/ui'
import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  allAttributeDamageKeys,
  allAttributeKeys,
  elementalData,
} from '@genshin-optimizer/zzz/consts'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
export const charBaseUiSheet: TagField[] = (
  [
    // hp/atk/def handled in TagDisplay
    'crit_',
    'crit_dmg_',
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

// generated standard targets for sheets
charBaseUiSheet.push(
  ...allAttributeKeys.map(
    (attr): TagField => ({
      fieldRef: {
        et: 'own',
        qt: 'formula',
        q: 'standardDmg',
        attribute: attr,
        damageType1: 'elemental',
        name: 'standardDmgInst',
      },
      title: <ColorText color={attr}>{elementalData[attr]} Damage</ColorText>,
    }),
  ),
  ...allAttributeKeys.map(
    (attr): TagField => ({
      fieldRef: {
        et: 'own',
        qt: 'formula',
        q: 'anomalyDmg',
        attribute: attr,
        damageType1: 'anomaly',
        name: 'anomalyDmgInst',
      },
      title: (
        <ColorText color={attr}>{elementalData[attr]} Anomaly Damage</ColorText>
      ),
    }),
  ),
)
