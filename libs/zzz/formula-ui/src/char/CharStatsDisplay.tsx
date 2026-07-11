import type { Read } from '@genshin-optimizer/game-opt/engine'
import {
  type Field,
  FieldDisplayList,
  type MultiTagField,
  MultiTagFieldDisplay,
  type TagField,
  TagFieldDisplay,
  isMultiTagField,
  isTagField,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  StatHighlightContext,
  ZCard,
  getHighlightRGBA,
  isHighlight,
} from '@genshin-optimizer/zzz/ui'
import { ListItem } from '@mui/material'
import { memo, useCallback, useContext, useMemo } from 'react'
import { OptFormulaSections } from '../OptFormulaSections'
import { formulaListingTagKey } from '../formulaFieldUtil'
import {
  useCharFormulaFields,
  useOptCategoryCollapse,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '../hooks'
import {
  formulaReadForTag,
  mergeTagForOpt,
  statKeyFromListingTag,
  statReadTagKey,
} from '../optTarget'
import { tagToTagField } from '../util'

export function CharStatsDisplay() {
  const character = useCharacterContext()
  const calc = useZzzCalcContext()
  const collapse = useOptCategoryCollapse()
  const { optTarget, resolvedOptTag } = useResolvedOptTarget()
  const { statReads, readByListingKey, categorySections, otherFields } =
    useCharFormulaFields(character?.key, calc)

  return (
    <ZCard>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        <OptFormulaSections
          statReads={statReads}
          otherFields={otherFields}
          categorySections={categorySections}
          collapse={collapse}
          renderStatRow={(read) => (
            <CharStatRow
              key={statReadTagKey(read.tag)}
              read={read}
              readByListingKey={readByListingKey}
              optTarget={optTarget}
              resolvedOptTag={resolvedOptTag}
            />
          )}
          renderFormulaField={(field, { section, category, index }) => (
            <FormulaFieldRow
              key={
                section === 'other' ? `other_${index}` : `${category}_${index}`
              }
              field={field}
              readByListingKey={readByListingKey}
              optTarget={optTarget}
              resolvedOptTag={resolvedOptTag}
            />
          )}
        />
      </FieldDisplayList>
    </ZCard>
  )
}

function FormulaFieldRow({
  field,
  readByListingKey,
  optTarget,
  resolvedOptTag,
}: {
  field: Field
  readByListingKey: Map<string, Read<Tag>>
  optTarget: TargetTag | undefined
  resolvedOptTag: Tag | undefined
}) {
  if (isMultiTagField(field))
    return (
      <MultiFormulaFieldRow
        field={field}
        optTarget={optTarget}
        resolvedOptTag={resolvedOptTag}
      />
    )
  if (isTagField(field))
    return (
      <CharStatRow
        sourceField={field}
        listingRead={readByListingKey.get(formulaListingTagKey(field.fieldRef))}
        readByListingKey={readByListingKey}
        optTarget={optTarget}
        resolvedOptTag={resolvedOptTag}
      />
    )
  return null
}

const CharStatRow = memo(function CharStatRow({
  read,
  sourceField,
  listingRead,
  readByListingKey,
  optTarget,
  resolvedOptTag,
}: {
  read?: Read<Tag>
  sourceField?: TagField
  listingRead?: Read<Tag>
  readByListingKey?: Map<string, Read<Tag>>
  optTarget: TargetTag | undefined
  resolvedOptTag: Tag | undefined
}) {
  const calc = useZzzCalcContext()
  const baseTag = sourceField?.fieldRef ?? read!.tag

  const mergedTag = useMemo(
    () => mergeTagForOpt(baseTag, resolvedOptTag, optTarget),
    [baseTag, resolvedOptTag, optTarget]
  )

  const calcRead = useMemo(
    () =>
      formulaReadForTag(calc, mergedTag, read ?? listingRead, readByListingKey),
    [calc, mergedTag, read, listingRead, readByListingKey]
  )

  const field = useMemo(
    () =>
      sourceField
        ? { ...sourceField, fieldRef: mergedTag }
        : tagToTagField(mergedTag),
    [mergedTag, sourceField]
  )

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const tagQStatKey = statKeyFromListingTag(mergedTag)
  const isHL = tagQStatKey ? isHighlight(statHighlight, tagQStatKey) : false

  const onMouseEnter = useCallback(() => {
    if (tagQStatKey) setStatHighlight(tagQStatKey)
  }, [tagQStatKey, setStatHighlight])
  const onMouseLeave = useCallback(() => {
    setStatHighlight('')
  }, [setStatHighlight])

  const rowSx = useMemo(
    () => ({
      position: 'relative' as const,
      '::after': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: getHighlightRGBA(isHL),
        transition: 'background-color 0.3s ease-in-out',
        pointerEvents: 'none' as const,
      },
    }),
    [isHL]
  )

  return (
    <TagFieldDisplay
      field={field}
      calcRead={calcRead}
      showZero
      component={ListItem}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      rowSx={rowSx}
    />
  )
})

const MultiFormulaFieldRow = memo(function MultiFormulaFieldRow({
  field,
  optTarget,
  resolvedOptTag,
}: {
  field: MultiTagField
  optTarget: TargetTag | undefined
  resolvedOptTag: Tag | undefined
}) {
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
    <MultiTagFieldDisplay field={mergedField} showZero component={ListItem} />
  )
})
