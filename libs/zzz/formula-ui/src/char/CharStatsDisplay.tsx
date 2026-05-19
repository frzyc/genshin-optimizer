import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import {
  type Field,
  FieldDisplayList,
  type MultiTagField,
  MultiTagFieldDisplay,
  TagFieldDisplay,
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { applyDamageTypeToTag, targetTag } from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  StatHighlightContext,
  ZCard,
  getHighlightRGBA,
  isHighlight,
} from '@genshin-optimizer/zzz/ui'
import { ListItem } from '@mui/material'
import { useContext, useMemo } from 'react'
import { groupFormulas } from '../groupFormulas'
import { useZzzCalcContext } from '../hooks'
import { tagToTagField } from '../util'

export function CharStatsDisplay() {
  const character = useCharacterContext()
  const calc = useZzzCalcContext()
  const fields = useMemo(() => {
    if (!calc) return []
    const reads = calc.listFormulas(own.listing.formulas)
    if (character?.key === 'Miyabi')
      return groupFormulas(reads, character.key, character.key)
    return reads.map((read) => tagToTagField(read.tag))
  }, [calc, character?.key])

  return (
    <ZCard>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        {fields.map((field, index) => (
          <FormulaFieldRow key={index} field={field} />
        ))}
      </FieldDisplayList>
    </ZCard>
  )
}

function FormulaFieldRow({ field }: { field: Field }) {
  if (isMultiTagField(field)) return <MultiFormulaFieldRow field={field} />
  if (isTagField(field)) return <CharStatRow tag={field.fieldRef} />
  return null
}

function useOptTargetTags() {
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const optTarget = team ? getTeamFrame0(team).tag : undefined
  const resolvedOptTag = useMemo(
    () => (optTarget ? targetTag(optTarget) : undefined),
    [optTarget]
  )
  return { optTarget, resolvedOptTag }
}

function mergeTagForOpt(
  tag: Tag,
  resolvedOptTag: Tag | undefined,
  optTarget: ReturnType<typeof getTeamFrame0>['tag']
) {
  if (
    resolvedOptTag &&
    tag.sheet === resolvedOptTag.sheet &&
    tag.name === resolvedOptTag.name &&
    tag.q === resolvedOptTag.q
  )
    return applyDamageTypeToTag(
      tag,
      optTarget?.damageType1,
      optTarget?.damageType2
    )
  return tag
}

function CharStatRow({ read, tag: tagIn }: { read?: Read<Tag>; tag?: Tag }) {
  const { setRead } = useContext(DebugReadContext)
  const { optTarget, resolvedOptTag } = useOptTargetTags()
  const baseTag = tagIn ?? read!.tag

  const mergedTag = useMemo(
    () => mergeTagForOpt(baseTag, resolvedOptTag, optTarget),
    [baseTag, resolvedOptTag, optTarget]
  )

  const calcRead = useMemo(
    () => (read ? read.withTag(mergedTag) : undefined),
    [mergedTag, read]
  )

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const tagQStatKey = mergedTag.name
    ? ''
    : mergedTag.attribute
      ? `${mergedTag.attribute}_${mergedTag.q}`
      : mergedTag.q === 'cappedCrit_'
        ? 'crit_'
        : mergedTag.q === 'anom_cappedCrit_'
          ? 'anom_crit_'
          : mergedTag.q
  const isHL = tagQStatKey
    ? isHighlight(statHighlight, tagQStatKey as StatKey)
    : false

  return (
    <TagFieldDisplay
      field={tagToTagField(mergedTag)}
      calcRead={calcRead}
      showZero
      component={ListItem}
      onMouseEnter={() => tagQStatKey && setStatHighlight(tagQStatKey)}
      onMouseLeave={() => setStatHighlight('')}
      rowSx={{
        position: 'relative',
        '::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: getHighlightRGBA(isHL),
          transition: 'background-color 0.3s ease-in-out',
          pointerEvents: 'none',
        },
      }}
      onClickFormula={
        shouldShowDevComponents && calcRead
          ? () => setRead(calcRead)
          : () => {}
      }
    />
  )
}

function MultiFormulaFieldRow({ field }: { field: MultiTagField }) {
  const { setRead } = useContext(DebugReadContext)
  const { optTarget, resolvedOptTag } = useOptTargetTags()

  const mergedField = useMemo(() => {
    return {
      ...field,
      fieldRefs: field.fieldRefs.map(({ label, ref }) => ({
        label,
        ref: mergeTagForOpt(ref, resolvedOptTag, optTarget),
      })),
    }
  }, [field, resolvedOptTag, optTarget])

  return (
    <MultiTagFieldDisplay
      field={mergedField}
      showZero
      component={ListItem}
      onClickFormula={
        shouldShowDevComponents ? (fieldRead) => setRead(fieldRead) : undefined
      }
    />
  )
}
