import { useBoolState } from '@genshin-optimizer/common/react-util'
import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useCallback } from 'react'
import OptimizationTargetDisplay from './OptimizationTargetDisplay'
import type { TargetSelectorModalProps } from './TargetSelectorModal'
import { TargetSelectorModal } from './TargetSelectorModal'

export default function OptimizationTargetSelector({
  optimizationTarget,
  setTarget,
  disabled = false,
  showEmptyTargets = false,
  defaultText,
  targetSelectorModalProps = {},
  buttonProps = {},
}: {
  optimizationTarget?: string[]
  setTarget: (target: string[]) => void
  disabled?: boolean
  showEmptyTargets?: boolean
  defaultText?: string
  targetSelectorModalProps?: Partial<TargetSelectorModalProps>
  buttonProps?: ButtonProps
}) {
  const [show, onShow, onClose] = useBoolState(false)

  const setTargetHandler = useCallback(
    (target: string[]) => {
      onClose()
      setTarget(target)
    },
    [onClose, setTarget],
  )
  return (
    <>
      <Button
        color="info"
        onClick={onShow}
        disabled={disabled}
        sx={{ flexGrow: 1 }}
        size="small"
        {...buttonProps}
      >
        <OptimizationTargetDisplay
          optimizationTarget={optimizationTarget}
          showEmptyTargets={showEmptyTargets}
          defaultText={defaultText}
        />
      </Button>
      <TargetSelectorModal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        showEmptyTargets={showEmptyTargets}
        {...targetSelectorModalProps}
      />
    </>
  )
}
