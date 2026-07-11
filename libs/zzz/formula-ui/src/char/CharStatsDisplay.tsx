import type { Read } from '@genshin-optimizer/game-opt/engine'
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
import {
  StatHighlightContext,
  ZCard,
  getHighlightRGBA,
  isHighlight,
} from '@genshin-optimizer/zzz/ui'
import { ListItem } from '@mui/material'
import { Fragment, memo, useCallback, useContext, useMemo } from 'react'
import {
  useGroupedOptFormulaFields,
  useOptCategoryCollapse,
  useZzzCalcContext,
} from '../hooks'
import { OptPanelSectionHeader } from '../optPanelSections'
import { formulaReadForTag, listingReadKey, statReadTagKey } from '../optTarget'
import { OptTargetCategorySectionHeader } from '../optTargetDisplay'
import { tagToTagField } from '../util'

export function CharStatsDisplay() {
  const character = useCharacterContext()
  const calc = useZzzCalcContext()
  const collapse = useOptCategoryCollapse()
  const { optTarget, resolvedOptTag } = useOptTargetTags()
  const { statReads, readByListingKey, categorySections, otherFields } =
    useGroupedOptFormulaFields(character?.key, calc)

  return (
    <ZCard>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        <OptPanelSectionHeader section="stats">Stats</OptPanelSectionHeader>
        {!(collapse?.isCollapsed('stats') ?? false) &&
          statReads.map((read) => (
            <CharStatRow
              key={statReadTagKey(read.tag)}
              read={read}
              readByListingKey={readByListingKey}
              optTarget={optTarget}
              resolvedOptTag={resolvedOptTag}
            />
          ))}
        {otherFields.length > 0 && (
          <>
            <OptPanelSectionHeader section="other">Other</OptPanelSectionHeader>
            {!(collapse?.isCollapsed('other') ?? false) &&
              otherFields.map((field, index) => (
                <FormulaFieldRow
                  key={`other_${index}`}
                  field={field}
                  readByListingKey={readByListingKey}
                  optTarget={optTarget}
                  resolvedOptTag={resolvedOptTag}
                />
              ))}
          </>
        )}
        {categorySections.map(({ category, fields }) => (
          <Fragment key={category}>
            <OptTargetCategorySectionHeader category={category} />
            {!(collapse?.isCollapsed(category) ?? false) &&
              fields.map((field, index) => (
                <FormulaFieldRow
                  key={`${category}_${index}`}
                  field={field}
                  readByListingKey={readByListingKey}
                  optTarget={optTarget}
                  resolvedOptTag={resolvedOptTag}
                />
              ))}
          </Fragment>
        ))}
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
  optTarget: ReturnType<typeof getTeamFrame0>['tag']
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
        tag={field.fieldRef}
        listingRead={readByListingKey.get(listingReadKey(field.fieldRef))}
        readByListingKey={readByListingKey}
        optTarget={optTarget}
        resolvedOptTag={resolvedOptTag}
      />
    )
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

const CharStatRow = memo(function CharStatRow({
  read,
  tag: tagIn,
  listingRead,
  readByListingKey,
  optTarget,
  resolvedOptTag,
}: {
  read?: Read<Tag>
  tag?: Tag
  listingRead?: Read<Tag>
  readByListingKey?: Map<string, Read<Tag>>
  optTarget: ReturnType<typeof getTeamFrame0>['tag']
  resolvedOptTag: Tag | undefined
}) {
  const calc = useZzzCalcContext()
  const baseTag = tagIn ?? read!.tag

  const mergedTag = useMemo(
    () => mergeTagForOpt(baseTag, resolvedOptTag, optTarget),
    [baseTag, resolvedOptTag, optTarget]
  )

  const calcRead = useMemo(
    () =>
      formulaReadForTag(calc, mergedTag, read ?? listingRead, readByListingKey),
    [calc, mergedTag, read, listingRead, readByListingKey]
  )

  const field = useMemo(() => tagToTagField(mergedTag), [mergedTag])

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
  optTarget: ReturnType<typeof getTeamFrame0>['tag']
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
