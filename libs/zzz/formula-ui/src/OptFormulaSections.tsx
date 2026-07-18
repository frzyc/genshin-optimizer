import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { Fragment, type ReactNode } from 'react'
import type { TalentSheetElementKey } from './char/consts'
import type { useOptCategoryCollapse } from './hooks/useOptCategoryCollapse'
import { OptPanelSectionHeader } from './optPanelSections'
import { OptTargetCategorySectionHeader } from './optTargetDisplay'

export type OptFormulaFieldContext = {
  section: 'other' | 'category'
  index: number
  category?: TalentSheetElementKey
}

export function OptFormulaSections({
  statReads,
  otherFields,
  categorySections,
  collapse,
  renderStatRow,
  renderFormulaField,
}: {
  statReads: Read<Tag>[]
  otherFields: Field[]
  categorySections: Array<{
    category: TalentSheetElementKey
    fields: Field[]
  }>
  collapse: ReturnType<typeof useOptCategoryCollapse>
  renderStatRow: (read: Read<Tag>) => ReactNode
  renderFormulaField: (field: Field, ctx: OptFormulaFieldContext) => ReactNode
}) {
  return (
    <>
      <OptPanelSectionHeader section="stats">Stats</OptPanelSectionHeader>
      {!(collapse?.isCollapsed('stats') ?? false) &&
        statReads.map((read) => renderStatRow(read))}
      {otherFields.length > 0 && (
        <>
          <OptPanelSectionHeader section="other">Other</OptPanelSectionHeader>
          {!(collapse?.isCollapsed('other') ?? false) &&
            otherFields.map((field, index) =>
              renderFormulaField(field, { section: 'other', index })
            )}
        </>
      )}
      {categorySections.map(({ category, fields }) => (
        <Fragment key={category}>
          <OptTargetCategorySectionHeader category={category} />
          {!(collapse?.isCollapsed(category) ?? false) &&
            fields.map((field, index) =>
              renderFormulaField(field, {
                section: 'category',
                category,
                index,
              })
            )}
        </Fragment>
      ))}
    </>
  )
}
