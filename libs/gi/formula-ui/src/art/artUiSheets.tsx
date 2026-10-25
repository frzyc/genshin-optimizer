import { objKeyMap } from '@genshin-optimizer/common/util'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { Document, UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { conditionals } from '@genshin-optimizer/gi/formula'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { ArtCondListValue, ArtCondName } from './artCondLabel'
import { Set1Display, Set2Display, Set4Display } from './SetDisplay'

type ArtSetNum = '1' | '2' | '4'

const setTitle = {
  1: <Set1Display />,
  2: <Set2Display />,
  4: <Set4Display />,
} as const

function artConditionals(
  setKey: ArtifactSetKey
): Record<string, IConditionalData> | undefined {
  return (conditionals as Record<string, Record<string, IConditionalData>>)[
    setKey
  ]
}

function pieceForCond(name: string, setNums: readonly number[]): ArtSetNum {
  const available = setNums.filter(
    (n): n is 1 | 2 | 4 => n === 1 || n === 2 || n === 4
  )
  const fallback = String(Math.max(...available, 1)) as ArtSetNum
  if (/\bset2\b/i.test(name) || /(?:^|_)2p(?:c)?(?:$|_)/i.test(name))
    return available.includes(2) ? '2' : fallback
  if (/\bset4\b/i.test(name) || /(?:^|_)4p(?:c)?(?:$|_)/i.test(name))
    return available.includes(4) ? '4' : fallback
  return fallback
}

function artUiSheet(setKey: ArtifactSetKey): UISheet<ArtSetNum> {
  const chg = (key: string) => (
    <Translate ns={`artifact_${setKey}_gen`} key18={key} />
  )
  const setNums = getArtSetStat(setKey).setNum
  const docs: Record<ArtSetNum, Document[]> = { 1: [], 2: [], 4: [] }

  for (const n of setNums) {
    if (n !== 1 && n !== 2 && n !== 4) continue
    docs[String(n) as ArtSetNum].push({
      type: 'text',
      text: chg(`setEffects.${n}`),
    })
  }

  const sheetConds = artConditionals(setKey)
  if (sheetConds) {
    for (const [name, metadata] of Object.entries(sheetConds)) {
      const piece = pieceForCond(name, setNums)
      const list = metadata.type === 'list' ? metadata.list : undefined
      docs[piece].push({
        type: 'conditional',
        conditional: {
          metadata,
          label: <ArtCondName setKey={setKey} name={name} />,
          badge:
            metadata.type === 'list'
              ? (_calc, value) =>
                  value === 0 ? (
                    <Translate ns="ui" key18="notActive" />
                  ) : (
                    <ArtCondListValue
                      setKey={setKey}
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

  const sheet: UISheet<ArtSetNum> = {}
  for (const n of ['1', '2', '4'] as const) {
    if (!setNums.includes(Number(n))) continue
    sheet[n] = {
      title: setTitle[n],
      documents: docs[n],
    }
  }
  return sheet
}

export const artUiSheets: Record<
  ArtifactSetKey,
  UISheet<ArtSetNum>
> = objKeyMap(allArtifactSetKeys, artUiSheet)
