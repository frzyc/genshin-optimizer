import { ColorText } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { useSetDebugTarget } from '@genshin-optimizer/game-opt/formula-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { FormulaRef, Tag } from '@genshin-optimizer/gi/formula'
import { lookupFormulaRef } from '@genshin-optimizer/gi/formula'
import { read } from '@genshin-optimizer/pando/engine'
import HelpIcon from '@mui/icons-material/Help'
import { useMemo } from 'react'
import { TalentSheetElementHeading } from './char/TalentSheetElementHeading'
import type { TalentSheetElementKey } from './char/consts'
import { TagDisplay } from './components/TagDisplay'
import { useGiCalcContext } from './hooks'
import { OptCollapsibleSectionHeader } from './optPanelSections'
import { tagTitleColor } from './tagLabel'

export function OptTargetSelectedLabel({
  formulaRef,
}: {
  formulaRef: FormulaRef
}) {
  const calc = useGiCalcContext()
  const { sheet, name, dim } = formulaRef
  const looked = useMemo(
    () => lookupFormulaRef({ sheet, name, dim }),
    [dim, name, sheet]
  )
  const colorTag = useMemo(() => {
    if (!looked) return undefined
    // Register-time ele is on the listing/catalog tag. Infusion hits omit it
    // and resolve on compute (`prep.ele` → `meta.tag.ele`).
    if (looked.tag.ele || !calc) return looked.tag
    return (calc.compute(read(looked.tag)).meta.tag ?? looked.tag) as Tag
  }, [calc, looked])

  if (!looked) return null
  const inner = <TagDisplay tag={looked.tag} plain />
  const color = colorTag ? tagTitleColor(colorTag) : undefined
  return <ColorText color={color}>{inner}</ColorText>
}

export function OptTargetCategorySectionHeader({
  characterKey,
  category,
}: {
  characterKey: CharacterKey
  category: TalentSheetElementKey
}) {
  return (
    <OptCollapsibleSectionHeader sectionKey={category}>
      <TalentSheetElementHeading
        characterKey={characterKey}
        talentKey={category}
      />
    </OptCollapsibleSectionHeader>
  )
}

/** Dev help icon: opens `DebugReadModal` for the current optimization target. */
export function OptTargetDebugHelp({
  tag,
  calcRead,
}: {
  tag: Tag
  calcRead?: Read<Tag>
}) {
  const setDebugTarget = useSetDebugTarget()

  if (!shouldShowDevComponents || !calcRead) return null

  return (
    <HelpIcon
      fontSize="small"
      aria-label="Debug optimization target formula"
      onClick={(e) => {
        e.stopPropagation()
        setDebugTarget?.(calcRead, tag)
      }}
      sx={{ flexShrink: 0, cursor: 'pointer' }}
    />
  )
}
