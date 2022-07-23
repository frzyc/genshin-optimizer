import { Button } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useContext } from 'react';
import ColorText from '../../../../../Components/ColoredText';
import ImgIcon from '../../../../../Components/Image/ImgIcon';
import SqBadge from '../../../../../Components/SqBadge';
import { DataContext } from '../../../../../Context/DataContext';
import { getDisplayHeader } from '../../../../../Formula/DisplayUtil';
import { NodeDisplay } from '../../../../../Formula/uiData';
import KeyMap from '../../../../../KeyMap';
import useBoolState from '../../../../../ReactHooks/useBoolState';
import usePromise from '../../../../../ReactHooks/usePromise';
import { objPathValue } from '../../../../../Util/Util';
import { TargetSelectorModal, TargetSelectorModalProps } from './TargetSelectorModal';

export default function OptimizationTargetSelector({ optimizationTarget, setTarget, disabled = false, useSubVariant = false, targetSelectorModalProps = {} }: {
  optimizationTarget?: string[], setTarget: (target: string[]) => void, disabled?: boolean, useSubVariant?: boolean, targetSelectorModalProps?: Partial<TargetSelectorModalProps>
}) {
  const [show, onShow, onClose] = useBoolState(false)

  const setTargetHandler = useCallback(
    (target: string[]) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget],
  )

  return <>
    <Button color="white" onClick={onShow} disabled={disabled} >
      <TargetDisplayText optimizationTarget={optimizationTarget} useSubVariant={useSubVariant} />
    </Button>
    <TargetSelectorModal show={show} onClose={onClose} setTarget={setTargetHandler} useSubVariant={useSubVariant} {...targetSelectorModalProps} />
  </>
}

function NoTarget() {
  return <b>Select an Optimization Target</b>
}
function TargetDisplayText({ optimizationTarget, useSubVariant = false }: { optimizationTarget?: string[], useSubVariant?: boolean }) {
  const { data } = useContext(DataContext)
  const displayHeader = usePromise(() => optimizationTarget && getDisplayHeader(data, optimizationTarget[0]), [data, optimizationTarget])

  if (!optimizationTarget || !displayHeader) return <NoTarget />

  const { title, icon, action } = displayHeader
  const node: NodeDisplay | undefined = objPathValue(data.getDisplay(), optimizationTarget) as any
  if (!node) return <NoTarget />
  return <b><Box display="flex" gap={1} alignItems="center">
    {!!icon && <SqBadge><ImgIcon src={icon} size={1.7} /></SqBadge>}
    {action}
    <span>{title}</span>
    <ColorText color={useSubVariant ? node.info.subVariant : node.info.variant}>{KeyMap.get(node.info.key)}</ColorText>
  </Box></b>
}
