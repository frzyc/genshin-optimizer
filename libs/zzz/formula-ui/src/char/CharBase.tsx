import { ColorText } from '@genshin-optimizer/common/ui'
import type { TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  allAttributeDamageKeys,
  allAttributeKeys,
  elementalData,
} from '@genshin-optimizer/zzz/consts'
import { specificDmgTypeKeys } from '@genshin-optimizer/zzz/db'
import type { Attribute, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import { damageTypeKeysMap } from './util'
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
    'anom_crit_',
    'anom_crit_dmg_',
  ] as const
).map((statKey) => {
  if (
    allAttributeDamageKeys.includes(
      statKey as (typeof allAttributeDamageKeys)[number]
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
  if (statKey === 'anom_crit_')
    return {
      fieldRef: own.common.anom_cappedCrit_.tag,
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
        name: 'standardDmgInst',
      },
      title: <ColorText color={attr}>{elementalData[attr]} Damage</ColorText>,
    })
  ),
  // elemental dmg with dmg types
  ...allAttributeKeys.flatMap((attr) =>
    specificDmgTypeKeys.map(
      (dmgType): TagField => ({
        fieldRef: {
          et: 'own',
          qt: 'formula',
          q: 'standardDmg',
          attribute: attr,
          damageType1: dmgType,
          name: 'standardDmgInst',
        },
        title: (
          <ColorText color={attr}>
            {elementalData[attr]} {damageTypeKeysMap[dmgType]} Damage
          </ColorText>
        ),
      })
    )
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
    })
  ),
  ...allAttributeKeys.map(
    (attr): TagField => ({
      fieldRef: {
        et: 'own',
        qt: 'formula',
        q: 'anomBuildup',
        attribute: attr,
        name: 'anomalyBuildupInst',
      },
      title: (
        <ColorText color={attr}>
          {elementalData[attr]} Anomaly Buildup
        </ColorText>
      ),
    })
  ),
  {
    fieldRef: {
      et: 'own',
      qt: 'formula',
      q: 'dazeBuildup',
      name: 'dazeInst',
    },
    title: 'Daze Buildup',
  }
)
