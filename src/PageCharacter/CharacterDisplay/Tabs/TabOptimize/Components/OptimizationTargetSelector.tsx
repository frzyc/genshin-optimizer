import { Button, Divider, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ImgIcon from '../../../../../Components/Image/ImgIcon';
import SqBadge from '../../../../../Components/SqBadge';
import { DataContext } from '../../../../../Context/DataContext';
import { DatabaseContext } from '../../../../../Database/Database';
import { getDisplayHeader } from '../../../../../Formula/DisplayUtil';
import { NodeDisplay } from '../../../../../Formula/uiData';
import useBoolState from '../../../../../ReactHooks/useBoolState';
import usePromise from '../../../../../ReactHooks/usePromise';
import { objPathValue } from '../../../../../Util/Util';
import { TargetSelectorModal, TargetSelectorModalProps } from './TargetSelectorModal';

export default function OptimizationTargetSelector({ optimizationTarget, setTarget, disabled = false, ignoreGlobal = false, defaultText, targetSelectorModalProps = {} }: {
  optimizationTarget?: string[], setTarget: (target: string[]) => void, disabled?: boolean, ignoreGlobal?: boolean, defaultText?: string, targetSelectorModalProps?: Partial<TargetSelectorModalProps>
}) {
  const { t } = useTranslation("page_character_optimize")
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

  if (!defaultText) defaultText = t("targetSelector.selectOptTarget")

  const { title, icon, action } = displayHeader ?? {}
  const node: NodeDisplay | undefined = optimizationTarget && objPathValue(data.getDisplay(), optimizationTarget) as any

  const invalidTarget = !optimizationTarget || !displayHeader || !node
    // Make sure the opt target is valid, if we are not in multi-target
    || (!ignoreGlobal && optimizationTarget && data.getDisplay()?.[optimizationTarget[0]][optimizationTarget[1]]?.isEmpty)

  const prevariant = invalidTarget ? "secondary" : node.info.variant
  const variant = prevariant === "invalid" ? undefined : prevariant

  const { textSuffix } = node?.info ?? {}
  const suffixDisplay = textSuffix && <span> {textSuffix}</span>
  const iconDisplay = icon ? <ImgIcon src={icon} size={2} sx={{ my: -1 }} /> : node?.info.icon
  return <>
    <Button color="info" onClick={onShow} disabled={disabled} sx={{ flexGrow: 1 }} >
      {invalidTarget ? <strong>{defaultText}</strong> : <Stack direction="row" divider={<Divider orientation='vertical' flexItem />} spacing={1}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {iconDisplay}
          <span>{title}</span>
          {!!action && <SqBadge color='success'>{action}</SqBadge>}
        </Box>
        <SqBadge color={variant}><strong>{node.info.name}</strong>{suffixDisplay}</SqBadge>
      </Stack>}
    </Button>
    <TargetSelectorModal show={show} onClose={onClose} setTarget={setTargetHandler} ignoreGlobal={ignoreGlobal} {...targetSelectorModalProps} />
  </>
}
