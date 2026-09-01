import type { Read } from '@genshin-optimizer/game-opt/engine'
import {
  type Field,
  FieldDisplayList,
  isMultiTagField,
  isTagField,
  type MultiTagField,
  MultiTagFieldDisplay,
  type TagField,
  TagFieldDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import { useCharacterContext } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  getHighlightRGBA,
  isHighlight,
  StatHighlightContext,
  ZCard,
} from '@genshin-optimizer/zzz/ui'
import { ListItem } from '@mui/material'
import { memo, useCallback, useContext, useMemo } from 'react'
import { TagDisplay } from '../components/TagDisplay'
import {
  useCharFormulaFields,
  useOptCategoryCollapse,
  useResolvedOptTarget,
  useZzzCalcContext,
} from '../hooks'
import { OptFormulaSections } from '../OptFormulaSections'
import {
  isListingStatTag,
  statKeyFromListingTag,
  statReadTagKey,
} from '../listingStatLabels'
import {
  formulaReadForTag,
  mergeMultiTagFieldForDisplay,
  mergeTagForOpt,
} from '../optTarget'

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
        readByListingKey={readByListingKey}
        optTarget={optTarget}
        resolvedOptTag={resolvedOptTag}
      />
    )
  if (isTagField(field))
    return (
      <CharStatRow
        sourceField={field}
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
  readByListingKey,
  optTarget,
  resolvedOptTag,
}: {
  read?: Read<Tag>
  sourceField?: TagField
  readByListingKey?: Map<string, Read<Tag>>
  optTarget: TargetTag | undefined
  resolvedOptTag: Tag | undefined
}) {
  const baseTag = sourceField?.fieldRef ?? read?.tag
  if (!baseTag) return null

  const mergedTag = useMemo(
    () => mergeTagForOpt(baseTag, resolvedOptTag, optTarget),
    [baseTag, resolvedOptTag, optTarget]
  )

  const calcRead = useMemo(
    () => formulaReadForTag(mergedTag, readByListingKey),
    [mergedTag, readByListingKey]
  )

  const field = useMemo(() => {
    if (sourceField) return { ...sourceField, fieldRef: mergedTag }
    if (read && isListingStatTag(mergedTag)) {
      return {
        title: <TagDisplay tag={mergedTag} />,
        fieldRef: mergedTag,
      }
    }
    console.error(
      '[zzz-formula-ui] CharStatRow: formula listing row missing sourceField',
      { mergedTag }
    )
    return null
  }, [mergedTag, read, sourceField])

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

  if (!field || !calcRead) return null

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
  readByListingKey,
  optTarget,
  resolvedOptTag,
}: {
  field: MultiTagField
  readByListingKey: Map<string, Read<Tag>>
  optTarget: TargetTag | undefined
  resolvedOptTag: Tag | undefined
}) {
  const resolved = useMemo(
    () =>
      mergeMultiTagFieldForDisplay(
        field,
        readByListingKey,
        resolvedOptTag,
        optTarget
      ),
    [field, readByListingKey, resolvedOptTag, optTarget]
  )

  if (!resolved) return null

  return (
    <MultiTagFieldDisplay
      field={resolved.field}
      getRead={resolved.getRead}
      showZero
      component={ListItem}
    />
  )
})
