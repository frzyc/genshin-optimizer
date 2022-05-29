import { Masonry } from '@mui/lab';
import { Button, CardContent, CardHeader, Divider, MenuItem, MenuList, styled } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import ColorText from '../../../../../Components/ColoredText';
import ImgIcon from '../../../../../Components/Image/ImgIcon';
import ModalWrapper from '../../../../../Components/ModalWrapper';
import { DataContext } from '../../../../../DataContext';
import { getDisplayHeader, getDisplaySections } from '../../../../../Formula/DisplayUtil';
import { DisplaySub } from '../../../../../Formula/type';
import { NodeDisplay } from '../../../../../Formula/uiData';
import KeyMap from '../../../../../KeyMap';
import usePromise from '../../../../../ReactHooks/usePromise';
import { objPathValue } from '../../../../../Util/Util';

const WhiteButton = styled(Button)({
  color: "black",
  backgroundColor: "white",
  "&:hover": {
    backgroundColor: "#e1e1e1",
  }
})
export default function OptimizationTargetSelector({ optimizationTarget, setTarget, disabled = false }: {
  optimizationTarget?: string[], setTarget: (target: string[]) => void, disabled
}) {
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => !disabled && setOpen(true), [setOpen, disabled])
  const onClose = useCallback(() => setOpen(false), [setOpen])

  const setTargetHandler = useCallback(
    (target: string[]) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget],
  )
  const { data } = useContext(DataContext)
  const sections = getDisplaySections(data)
  return <>
    <WhiteButton onClick={onOpen} disabled={disabled} >
      <TargetDisplayText optimizationTarget={optimizationTarget} />
    </WhiteButton>
    <ModalWrapper open={open} onClose={onClose}>
      <CardDark >
        <CardContent>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={1}>
            {sections.map(([key, Nodes]) =>
              <SelectorSection key={key} displayNs={Nodes} sectionKey={key} setTarget={setTargetHandler} />)}
          </Masonry >
        </CardContent>
      </CardDark>
    </ModalWrapper>
  </>
}
function SelectorSection({ displayNs, sectionKey, setTarget }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string, setTarget: (target: string[]) => void }) {
  const { data } = useContext(DataContext)
  const header = usePromise(getDisplayHeader(data, sectionKey), [data, sectionKey])
  return <CardLight key={sectionKey as string}>
    {header && <CardHeader avatar={header.icon && <ImgIcon size={2} sx={{ m: -1 }} src={header.icon} />} title={header.title} action={header.action} titleTypographyProps={{ variant: "subtitle1" }} />}
    <Divider />
    <MenuList>
      {Object.entries(displayNs).map(([key, n]) =>
        <TargetSelectorMenuItem key={key} node={n} onClick={() => setTarget([sectionKey, key])} />)}
    </MenuList>
  </CardLight>
}
function NoTarget() {
  return <b>Select an Optimization Target</b>
}
function TargetDisplayText({ optimizationTarget }: { optimizationTarget?: string[] }) {
  const { data } = useContext(DataContext)
  const displayHeader = usePromise(optimizationTarget && getDisplayHeader(data, optimizationTarget[0]), [data, optimizationTarget])

  if (!optimizationTarget || !displayHeader) return <NoTarget />
  const node: NodeDisplay | undefined = objPathValue(data.getDisplay(), optimizationTarget) as any
  if (!node) return <NoTarget />

  return <b>{displayHeader.title} : {<ColorText color={node.info.variant}>{KeyMap.get(node.info.key)}</ColorText>}</b>
}
function TargetSelectorMenuItem({ node, onClick }: { node: NodeDisplay, onClick: () => void }) {
  if (node.isEmpty) return null
  return <MenuItem onClick={onClick} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
    <ColorText color={node.info.variant} >{KeyMap.get(node.info.key)}</ColorText>
  </MenuItem>
}
