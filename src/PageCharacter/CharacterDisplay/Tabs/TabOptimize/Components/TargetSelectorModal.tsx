import { Masonry } from "@mui/lab"
import { CardContent, CardHeader, Divider, MenuItem, MenuList } from "@mui/material"
import { useContext } from "react"
import CardDark from "../../../../../Components/Card/CardDark"
import CardLight from "../../../../../Components/Card/CardLight"
import ColorText from "../../../../../Components/ColoredText"
import ImgIcon from "../../../../../Components/Image/ImgIcon"
import ModalWrapper from "../../../../../Components/ModalWrapper"
import { DataContext } from "../../../../../Context/DataContext"
import { getDisplayHeader, getDisplaySections } from "../../../../../Formula/DisplayUtil"
import { DisplaySub } from "../../../../../Formula/type"
import { NodeDisplay } from "../../../../../Formula/uiData"
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
  const { data } = useContext(DataContext)
  const sections = getDisplaySections(data).filter(([key]) => !excludeSections.includes(key))
    // Determine if a section has all empty entries
    .filter(([key, sectionObj]) =>
      Object.values(sectionObj).some(n => !n.isEmpty && (!flatOnly || !(flatOnly && KeyMap.unit(n.info.key))))
    )

  return <ModalWrapper open={show} onClose={onClose}>
    <CardDark >
      <CardContent>
        <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>
          {sections.map(([key, Nodes]) =>
            <SelectorSection key={key} displayNs={Nodes} sectionKey={key} setTarget={setTarget} useSubVariant={useSubVariant} flatOnly={flatOnly} />)}
        </Masonry >
      </CardContent>
    </CardDark>
  </ModalWrapper>
}
function SelectorSection({ displayNs, sectionKey, setTarget, useSubVariant = false, flatOnly = false }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string, setTarget: (target: string[]) => void, useSubVariant?: boolean, flatOnly?: boolean }) {
  const { data } = useContext(DataContext)
  const header = usePromise(()=>getDisplayHeader(data, sectionKey), [data, sectionKey])
  return <CardLight key={sectionKey as string}>
    {header && <CardHeader avatar={header.icon && <ImgIcon size={2} sx={{ m: -1 }} src={header.icon} />} title={header.title} action={header.action} titleTypographyProps={{ variant: "subtitle1" }} />}
    <Divider />
    <MenuList>
      {Object.entries(displayNs).map(([key, n]) =>
        <TargetSelectorMenuItem key={key} node={n} onClick={() => setTarget([sectionKey, key])} useSubVariant={useSubVariant} flatOnly={flatOnly} />)}
    </MenuList>
  </CardLight>
}

function TargetSelectorMenuItem({ node, onClick, useSubVariant = false, flatOnly = false }: { node: NodeDisplay, onClick: () => void, useSubVariant?: boolean, flatOnly?: boolean }) {
  if (node.isEmpty) return null
  if (flatOnly && KeyMap.unit(node.info.key)) return null
  return <MenuItem onClick={onClick} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
    <ColorText color={useSubVariant ? node.info.subVariant : node.info.variant} >{KeyMap.get(node.info.key)}</ColorText>
  </MenuItem>
}
