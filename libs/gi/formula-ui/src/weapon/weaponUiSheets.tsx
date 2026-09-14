import { objKeyMap } from '@genshin-optimizer/common/util'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allWeaponKeys } from '@genshin-optimizer/gi/consts'
import { conditionals } from '@genshin-optimizer/gi/formula'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { WeaponCondListValue, WeaponCondName } from './weaponCondLabel'

function weaponConditionals(
  weaponKey: WeaponKey
): Record<string, IConditionalData> | undefined {
  return (conditionals as Record<string, Record<string, IConditionalData>>)[
    weaponKey
  ]
}

function weaponUiSheet(weaponKey: WeaponKey): UISheetElement {
  const documents: Document[] = []
  const sheetConds = weaponConditionals(weaponKey)
  if (sheetConds) {
    for (const [name, metadata] of Object.entries(sheetConds)) {
      const list = metadata.type === 'list' ? metadata.list : undefined
      documents.push({
        type: 'conditional',
        conditional: {
          metadata,
          label: <WeaponCondName weaponKey={weaponKey} name={name} />,
          badge:
            metadata.type === 'list'
              ? (_calc, value) =>
                  value === 0 ? (
                    <Translate ns="ui" key18="notActive" />
                  ) : (
                    <WeaponCondListValue
                      weaponKey={weaponKey}
                      val={list?.[value - 1] ?? ''}
                    />
                  )
              : metadata.type === 'num'
                ? (_calc, value) => (value === 0 ? null : value)
                : undefined,
        },
      })
    }
  }

  return {
    title: null,
    documents,
  }
}

export const weaponUiSheets: Record<WeaponKey, UISheetElement> = objKeyMap(
  allWeaponKeys,
  weaponUiSheet
)
