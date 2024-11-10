import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  DataContext,
  NodeFieldDisplayText,
  getDisplayHeader,
  getDisplaySections,
  resolveInfo,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import CloseIcon from '@mui/icons-material/Close'
import { Masonry } from '@mui/lab'
import {
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  MenuItem,
  MenuList,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export interface TargetSelectorModalProps {
  show: boolean
  onClose: () => void
  setTarget: (target: string[], multi?: number) => void
  showEmptyTargets?: boolean
  flatOnly?: boolean
  excludeSections?: string[]
  excludeHeal?: boolean
}
export function TargetSelectorModal({
  show,
  onClose,
  setTarget,
  showEmptyTargets = false,
  flatOnly = false,
  excludeSections = [],
  excludeHeal = false,
}: TargetSelectorModalProps) {
  const { data } = useContext(DataContext)
  const { t } = useTranslation('page_character_optimize')

  const sections = useMemo(() => {
    return (
      getDisplaySections(data)
        .filter(([key]) => !excludeSections.includes(key))
        .map(
          ([key, sectionObj]) =>
            [
              key,
              Object.fromEntries(
                Object.entries(sectionObj).filter(([_sectionKey, node]) => {
                  const { unit, variant } = resolveInfo(node.info)

                  if (flatOnly && unit === '%') return false

                  if (excludeHeal && variant === 'heal') return false

                  if (!showEmptyTargets && node.isEmpty && key !== 'basic')
                    return false

                  return true
                })
              ) as DisplaySub<CalcResult>,
            ] as [string, DisplaySub<CalcResult>]
        )
        // Determine if a section has all empty entries
        .filter(([_key, sectionObj]) => Object.keys(sectionObj).length)
    )
  }, [data, excludeSections, flatOnly, showEmptyTargets, excludeHeal])

  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title={t('targetSelectorTitle')}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>
            {sections.map(([key, Nodes]) => (
              <SelectorSection
                key={key}
                displayNs={Nodes}
                sectionKey={key}
                setTarget={setTarget}
              />
            ))}
          </Masonry>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function SelectorSection({
  displayNs,
  sectionKey,
  setTarget,
}: {
  displayNs: DisplaySub<CalcResult>
  sectionKey: string
  setTarget: (target: string[], multi?: number) => void
  flatOnly?: boolean
}) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const header = useMemo(
    () => getDisplayHeader(data, sectionKey, database),
    [data, sectionKey, database]
  )
  return (
    <CardThemed bgt="light" key={sectionKey as string}>
      {header && (
        <CardHeader
          avatar={header.icon}
          title={header.title}
          action={header.action && <SqBadge>{header.action}</SqBadge>}
          titleTypographyProps={{ variant: 'subtitle1' }}
        />
      )}
      <Divider />
      <MenuList>
        {Object.entries(displayNs).map(([key, n]) => (
          <TargetSelectorMenuItem
            key={key}
            node={n}
            onClick={() => setTarget([sectionKey, key], n.info.multi)}
          />
        ))}
      </MenuList>
    </CardThemed>
  )
}

function TargetSelectorMenuItem({
  node,
  onClick,
}: {
  node: CalcResult
  onClick: () => void
}) {
  return (
    <MenuItem onClick={onClick} style={{ whiteSpace: 'normal' }}>
      <NodeFieldDisplayText node={node} />
    </MenuItem>
  )
}
