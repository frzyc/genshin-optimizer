import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import type { ReactNode } from 'react'
import { CharCondListValue, CharCondName } from './charCondLabel'

/** Standard conditional row — list/num badges match weapon/art UI sheets. */
export function charConditionalDocument(
  characterKey: CharacterKey,
  metadata: IConditionalData,
  opts?: {
    label?: ReactNode
    teamBuff?: boolean
    fields?: Field[]
  }
): Document {
  const list = metadata.type === 'list' ? metadata.list : undefined
  return {
    type: 'conditional',
    conditional: {
      metadata,
      label: opts?.label ?? (
        <CharCondName characterKey={characterKey} name={metadata.name} />
      ),
      teamBuff: opts?.teamBuff,
      fields: opts?.fields,
      badge:
        metadata.type === 'list'
          ? (_calc, value) =>
              value === 0 ? (
                <Translate ns="ui" key18="notActive" />
              ) : (
                <CharCondListValue
                  characterKey={characterKey}
                  val={list?.[value - 1] ?? ''}
                />
              )
          : metadata.type === 'num'
            ? (_calc, value) => (value === 0 ? null : value)
            : undefined,
    },
  }
}
