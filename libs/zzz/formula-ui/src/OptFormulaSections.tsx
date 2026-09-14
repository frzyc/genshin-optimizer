import { Fragment, type ReactNode } from 'react'
import type { CatalogJoinedRow } from './catalogListing'
import type { TalentSheetElementKey } from './char/consts'
import type { useOptCategoryCollapse } from './hooks/useOptCategoryCollapse'
import { OptPanelSectionHeader } from './optPanelSections'
import { OptTargetCategorySectionHeader } from './optTargetDisplay'

export function OptFormulaSections({
  statRows,
  otherRows,
  categorySections,
  collapse,
  renderRow,
}: {
  statRows: CatalogJoinedRow[]
  otherRows: CatalogJoinedRow[]
  categorySections: Array<{
    category: TalentSheetElementKey
    rows: CatalogJoinedRow[]
  }>
  collapse: ReturnType<typeof useOptCategoryCollapse>
  renderRow: (row: CatalogJoinedRow) => ReactNode
}) {
  return (
    <>
      <OptPanelSectionHeader section="stats">Stats</OptPanelSectionHeader>
      {!(collapse?.isCollapsed('stats') ?? false) &&
        statRows.map((row) => renderRow(row))}
      {otherRows.length > 0 && (
        <>
          <OptPanelSectionHeader section="other">Other</OptPanelSectionHeader>
          {!(collapse?.isCollapsed('other') ?? false) &&
            otherRows.map((row) => renderRow(row))}
        </>
      )}
      {categorySections.map(({ category, rows }) => (
        <Fragment key={category}>
          <OptTargetCategorySectionHeader category={category} />
          {!(collapse?.isCollapsed(category) ?? false) &&
            rows.map((row) => renderRow(row))}
        </Fragment>
      ))}
    </>
  )
}
