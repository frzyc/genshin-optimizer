import { Masonry } from "@mui/lab"
import { CardContent, CardHeader, Divider, MenuItem, MenuList } from "@mui/material"
import { useContext, useMemo } from "react"
import CardDark from "../../../../../Components/Card/CardDark"
import CardLight from "../../../../../Components/Card/CardLight"
import ColorText from "../../../../../Components/ColoredText"
import ImgIcon from "../../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../../Components/ModalWrapper"
import SqBadge from "../../../../../Components/SqBadge"
import { DataContext } from "../../../../../Context/DataContext"
import { getDisplayHeader, getDisplaySections } from "../../../../../Formula/DisplayUtil"
import { DisplaySub } from "../../../../../Formula/type"
import { NodeDisplay, UIData } from "../../../../../Formula/uiData"
import KeyMap from "../../../../../KeyMap"
import usePromise from "../../../../../ReactHooks/usePromise"

export interface TargetSelectorModalProps {
  show: boolean,
  onClose: () => void,
  setTarget: (target: string[]) => void,
  useSubVariant?: boolean,
  flatOnly?: boolean
  excludeSections?: string[]
}
export function TargetSelectorModal({ show, onClose, setTarget, useSubVariant = false, flatOnly = false, excludeSections = [] }: TargetSelectorModalProps) {
  const { data: origUIData } = useContext(DataContext)

  const sections = useMemo(() => {
    let data: UIData
    if (useSubVariant) {
      // Make sure that the fields we're deleting belong to
      // copies. We don't need deep copies though, as the
      // rest of the Data are still intact.
      const origData = origUIData.data[0]
      const newData = { ...origData, hit: { ...origData.hit }, infusion: { ...origData.infusion } }
      delete newData.hit.reaction
      delete newData.infusion.team
      data = new UIData(newData, undefined)
    } else {
      data = origUIData
    }

    return getDisplaySections(data).filter(([key]) => !excludeSections.includes(key))
      .map(([key, sectionObj]) => [key, Object.fromEntries(Object.entries(sectionObj).filter(([sectionKey, node]) => {
        if (flatOnly && KeyMap.unit(node.info.key) === "%") return false

        // Assume `useSubVariant`= multitarget, ignore heal nodes on multi-target
        if (useSubVariant && node.info.variant === "success") return false

        // Assume `useSubVariant`= multitarget, allow showing of empty nodes as targets.
        if (!useSubVariant && node.isEmpty) return false
        return true
      })) as DisplaySub<NodeDisplay>] as [string, DisplaySub<NodeDisplay>])
      // Determine if a section has all empty entries
      .filter(([key, sectionObj]) => Object.keys(sectionObj).length)
  }, [origUIData, excludeSections, flatOnly, useSubVariant])

  return <ModalWrapper open={show} onClose={onClose}>
    <CardDark>
      <CardContent>
        <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>
          {sections.map(([key, Nodes]) =>
            <SelectorSection key={key} displayNs={Nodes} sectionKey={key} setTarget={setTarget} />)}
        </Masonry >
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
function SelectorSection({ displayNs, sectionKey, setTarget }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string, setTarget: (target: string[]) => void, flatOnly?: boolean }) {
  const { data } = useContext(DataContext)
  const header = usePromise(() => getDisplayHeader(data, sectionKey), [data, sectionKey])
  return <CardLight key={sectionKey as string}>
    {header && <CardHeader avatar={header.icon && <ImgIcon size={2} sx={{ m: -1 }} src={header.icon} />} title={header.title} action={header.action && <SqBadge>{header.action}</SqBadge>} titleTypographyProps={{ variant: "subtitle1" }} />}
    <Divider />
    <MenuList>
      {Object.entries(displayNs).map(([key, n]) =>
        <TargetSelectorMenuItem key={key} node={n} onClick={() => setTarget([sectionKey, key])} />)}
    </MenuList>
  </CardLight>
}

function TargetSelectorMenuItem({ node, onClick }: { node: NodeDisplay, onClick: () => void }) {
  return <MenuItem onClick={onClick} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
    <ColorText color={node.info.variant} >{KeyMap.get(node.info.key)}</ColorText>
  </MenuItem>
}
