import { useBoolState } from '@genshin-optimizer/common/react-util'
import { arrayMove, clamp, deepClone } from '@genshin-optimizer/common/util'
import type { CustomMultiTarget, CustomTarget } from '@genshin-optimizer/gi/db'
import { initCustomTarget } from '@genshin-optimizer/gi/db'
import AddIcon from '@mui/icons-material/Add'
import { Button } from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TargetSelectorModal } from '../Tabs/TabOptimize/Components/TargetSelectorModal'
import CustomTargetDisplay from './CustomTargetDisplay'
import MTargetEditor from './MTargetEditor'

export default function TargetListEditor({
  customMultiTarget,
  setCustomMultiTarget,
}: {
  customMultiTarget: CustomMultiTarget
  setCustomMultiTarget: (t: CustomMultiTarget) => void
}) {
  const { t } = useTranslation('page_character')
  const [selectedTarget, setSelectedTarget] = useState(-1)

  const addTarget = useCallback(
    (t: string[], m?: number) => {
      setCustomMultiTarget({
        ...customMultiTarget,
        targets: [...customMultiTarget.targets, initCustomTarget(t, m)],
      })
    },
    [customMultiTarget, setCustomMultiTarget]
  )

  const setCustomTarget = useCallback(
    (index: number) => (ctarget: CustomTarget) => {
      const targets = [...customMultiTarget.targets]
      targets[index] = ctarget
      setCustomMultiTarget({ ...customMultiTarget, targets })
    },
    [customMultiTarget, setCustomMultiTarget]
  )

  const deleteCustomTarget = useCallback(
    (index: number) => () => {
      if (
        Object.values(customMultiTarget.targets[index].bonusStats).length &&
        !window.confirm(t('multiTarget.confirm'))
      )
        return
      const targets = [...customMultiTarget.targets]
      targets.splice(index, 1)
      setCustomMultiTarget({ ...customMultiTarget, targets })
    },
    [customMultiTarget, setCustomMultiTarget, t]
  )

  const setTargetIndex = useCallback(
    (oldInd: number) => (newRank?: number) => {
      if (newRank === undefined || newRank === 0) return
      newRank = clamp(newRank, 1, customMultiTarget.targets.length)
      const newInd = newRank - 1
      const targets = [...customMultiTarget.targets]
      arrayMove(targets, oldInd, newInd)
      setCustomMultiTarget({ ...customMultiTarget, targets })
      setSelectedTarget(newRank - 1)
    },
    [customMultiTarget, setCustomMultiTarget]
  )

  const dupCustomTarget = useCallback(
    (index: number) => () => {
      const targets = [...customMultiTarget.targets]
      targets.splice(index, 0, deepClone(targets[index]))
      setCustomMultiTarget({ ...customMultiTarget, targets })
    },
    [customMultiTarget, setCustomMultiTarget]
  )

  const customTargetDisplays = useMemo(
    () =>
      customMultiTarget.targets.map((t, i) => (
        <CustomTargetDisplay
          key={t.path.join() + i}
          selected={selectedTarget === i}
          setSelect={() =>
            selectedTarget === i ? setSelectedTarget(-1) : setSelectedTarget(i)
          }
          customTarget={t}
          rank={i + 1}
        />
      )),
    [customMultiTarget.targets, selectedTarget]
  )
  const selectedTargetValid = clamp(
    selectedTarget,
    -1,
    customMultiTarget.targets.length - 1
  )

  return (
    <>
      {customTargetDisplays}
      <AddCustomTargetBtn setTarget={addTarget} />
      {customMultiTarget.targets[selectedTargetValid] && (
        <MTargetEditor
          customTarget={customMultiTarget.targets[selectedTargetValid]}
          setCustomTarget={setCustomTarget(selectedTargetValid)}
          deleteCustomTarget={deleteCustomTarget(selectedTargetValid)}
          rank={selectedTargetValid + 1}
          maxRank={customMultiTarget.targets.length}
          setTargetIndex={setTargetIndex(selectedTargetValid)}
          onDup={dupCustomTarget(selectedTargetValid)}
        />
      )}
    </>
  )
}

function AddCustomTargetBtn({
  setTarget,
}: {
  setTarget: (t: string[], m?: number) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  const setTargetHandler = useCallback(
    (target: string[], multi?: number) => {
      onClose()
      setTarget(target, multi)
    },
    [onClose, setTarget]
  )

  return (
    <>
      <Button fullWidth onClick={onShow} startIcon={<AddIcon />} sx={{ mb: 1 }}>
        {t('multiTarget.addNewTarget')}
      </Button>
      <TargetSelectorModal
        showEmptyTargets
        flatOnly
        excludeHeal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        excludeSections={[
          'basic',
          'bonusStats',
          'custom',
          'character',
          'teamBuff',
        ]}
      />
    </>
  )
}
