import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { CatalogJoinedRow } from './catalogListing'
import type { TalentSheetElementKey } from './char/consts'
import { useOptCategoryCollapse } from './hooks/useOptCategoryCollapse'
import { OptPanelSectionHeader } from './optPanelSections'
import { OptTargetCategorySectionHeader } from './optTargetDisplay'

export function OptFormulaSections({
  characterKey,
  statRows,
  otherRows,
  categorySections,
  renderRow,
}: {
  characterKey: CharacterKey
  statRows: CatalogJoinedRow[]
  otherRows: CatalogJoinedRow[]
  categorySections: Array<{
    category: TalentSheetElementKey
    rows: CatalogJoinedRow[]
  }>
  renderRow: (row: CatalogJoinedRow) => ReactNode
}) {
  const { t } = useTranslation('page_optimize')
  const collapse = useOptCategoryCollapse()
  return (
    <>
      <OptPanelSectionHeader section="stats">
        {t('stats')}
      </OptPanelSectionHeader>
      {!(collapse?.isCollapsed('stats') ?? false) &&
        statRows.map((row) => renderRow(row))}
      {otherRows.length > 0 && (
        <>
          <OptPanelSectionHeader section="other">
            {t('other')}
          </OptPanelSectionHeader>
          {!(collapse?.isCollapsed('other') ?? false) &&
            otherRows.map((row) => renderRow(row))}
        </>
      )}
      {categorySections.map(({ category, rows }) => (
        <Fragment key={category}>
          <OptTargetCategorySectionHeader
            characterKey={characterKey}
            category={category}
          />
          {!(collapse?.isCollapsed(category) ?? false) &&
            rows.map((row) => renderRow(row))}
        </Fragment>
      ))}
    </>
  )
}
