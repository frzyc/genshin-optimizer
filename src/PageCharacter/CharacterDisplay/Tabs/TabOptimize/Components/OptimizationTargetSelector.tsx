import { Button, Divider, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useContext } from 'react';
import ImgIcon from '../../../../../Components/Image/ImgIcon';
import SqBadge from '../../../../../Components/SqBadge';
import { DataContext } from '../../../../../Context/DataContext';
import { DatabaseContext } from '../../../../../Database/Database';
import { getDisplayHeader } from '../../../../../Formula/DisplayUtil';
import { NodeDisplay } from '../../../../../Formula/uiData';
import KeyMap from '../../../../../KeyMap';
import useBoolState from '../../../../../ReactHooks/useBoolState';
import usePromise from '../../../../../ReactHooks/usePromise';
import { objPathValue } from '../../../../../Util/Util';
import { TargetSelectorModal, TargetSelectorModalProps } from './TargetSelectorModal';

export default function OptimizationTargetSelector({ optimizationTarget, setTarget, disabled = false, ignoreGlobal = false, targetSelectorModalProps = {} }: {
  optimizationTarget?: string[], setTarget: (target: string[]) => void, disabled?: boolean, ignoreGlobal?: boolean, targetSelectorModalProps?: Partial<TargetSelectorModalProps>
}) {
  const [show, onShow, onClose] = useBoolState(false)

  const setTargetHandler = useCallback(
    (target: string[]) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget],
  )
  const { data } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const displayHeader = usePromise(() => optimizationTarget && getDisplayHeader(data, optimizationTarget[0], database), [data, optimizationTarget, database])

  const { title, icon, action } = displayHeader ?? {}
  const node: NodeDisplay | undefined = optimizationTarget && objPathValue(data.getDisplay(), optimizationTarget) as any

  const invalidTarget = !optimizationTarget || !displayHeader || !node

  const prevariant = invalidTarget ? "secondary" : node.info.variant
  const variant = prevariant === "invalid" ? undefined : prevariant

  return <>
    <Button color="info" onClick={onShow} disabled={disabled} >
      {invalidTarget ? <strong>Select an Optimization Target</strong> : <Stack direction="row" divider={<Divider orientation='vertical' flexItem />} spacing={1}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {!!icon && <ImgIcon src={icon} size={2} sx={{ my: -1 }} />}
          <span>{title}</span>
          {!!action && <SqBadge color='success'>{action}</SqBadge>}
        </Box>
        <SqBadge color={variant}><strong>{KeyMap.get(node.info.key)}</strong></SqBadge>
      </Stack>}
    </Button>
    <TargetSelectorModal show={show} onClose={onClose} setTarget={setTargetHandler} ignoreGlobal={ignoreGlobal} {...targetSelectorModalProps} />
  </>
}
