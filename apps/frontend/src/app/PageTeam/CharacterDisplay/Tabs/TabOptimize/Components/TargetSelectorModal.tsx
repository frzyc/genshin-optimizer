import { Masonry } from '@mui/lab'
import {
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  MenuList,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import { NodeFieldDisplayText } from '../../../../../Components/FieldDisplay'
import ImgIcon from '../../../../../Components/Image/ImgIcon'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SqBadge from '../../../../../Components/SqBadge'
import { DataContext } from '../../../../../Context/DataContext'
import { DatabaseContext } from '../../../../../Database/Database'
import {
  getDisplayHeader,
  getDisplaySections,
} from '../../../../../Formula/DisplayUtil'
import type { DisplaySub } from '../../../../../Formula/type'
import type { NodeDisplay } from '../../../../../Formula/uiData'

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
                  if (flatOnly && node.info.unit === '%') return false

                  if (excludeHeal && node.info.variant === 'heal') return false

                  if (!showEmptyTargets && node.isEmpty) return false
                  return true
                })
              ) as DisplaySub<NodeDisplay>,
            ] as [string, DisplaySub<NodeDisplay>]
        )
        // Determine if a section has all empty entries
        .filter(([_key, sectionObj]) => Object.keys(sectionObj).length)
    )
  }, [data, excludeSections, flatOnly, showEmptyTargets, excludeHeal])

  return (
    <ModalWrapper open={show} onClose={onClose}>
      <CardDark>
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
      </CardDark>
    </ModalWrapper>
  )
}
function SelectorSection({
  displayNs,
  sectionKey,
  setTarget,
}: {
  displayNs: DisplaySub<NodeDisplay>
  sectionKey: string
  setTarget: (target: string[], multi?: number) => void
  flatOnly?: boolean
}) {
  const { data } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const header = useMemo(
    () => getDisplayHeader(data, sectionKey, database),
    [data, sectionKey, database]
  )
  return (
    <CardLight key={sectionKey as string}>
      {header && (
        <CardHeader
          avatar={header.icon && <ImgIcon size={2} src={header.icon} />}
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
    </CardLight>
  )
}

function TargetSelectorMenuItem({
  node,
  onClick,
}: {
  node: NodeDisplay
  onClick: () => void
}) {
  return (
    <MenuItem onClick={onClick} style={{ whiteSpace: 'normal' }}>
      <NodeFieldDisplayText node={node} />
    </MenuItem>
  )
}
