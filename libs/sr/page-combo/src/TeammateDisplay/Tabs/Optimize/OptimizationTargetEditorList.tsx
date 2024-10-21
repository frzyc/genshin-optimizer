import { NumberInputLazy } from '@genshin-optimizer/common/ui'
import type { UnArray } from '@genshin-optimizer/common/util'
import { type StatFilters } from '@genshin-optimizer/sr/db'
import type { Read } from '@genshin-optimizer/sr/formula'
import {
  CheckBox,
  CheckBoxOutlineBlank,
  DeleteForever,
} from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { useCallback, useMemo } from 'react'
import { OptimizationTargetSelector } from './OptimizationTargetSelector'

type OptimizationTargetEditorListProps = {
  statFilters: StatFilters
  setStatFilters: (statFilters: StatFilters) => void
  disabled: boolean
}

export default function OptimizationTargetEditorList({
  statFilters,
  setStatFilters,
  disabled = false,
}: OptimizationTargetEditorListProps) {
  const setTarget = useCallback(
    (read: Read, oldIndex?: number) => {
      const statFilters_ = structuredClone(statFilters)
      if (typeof oldIndex === 'undefined')
        statFilters_.push({
          read,
          value: 0,
          isMax: false,
          disabled: false,
        })
      else statFilters_[oldIndex].read = read
      setStatFilters(statFilters_)
    },
    [setStatFilters, statFilters]
  )

  const delTarget = useCallback(
    (index: number) => {
      const statFilters_ = structuredClone(statFilters)
      statFilters_.splice(index, 1)
      setStatFilters(statFilters_)
    },
    [setStatFilters, statFilters]
  )
  const setTargetValue = useCallback(
    (index: number, value: number) => {
      const statFilters_ = structuredClone(statFilters)
      statFilters_[index].value = value
      setStatFilters(statFilters_)
    },
    [setStatFilters, statFilters]
  )
  const setTargetisMax = useCallback(
    (index: number, isMax: boolean) => {
      const statFilters_ = structuredClone(statFilters)
      statFilters_[index].isMax = isMax
      setStatFilters(statFilters_)
    },
    [setStatFilters, statFilters]
  )
  const setTargetDisabled = useCallback(
    (index: number, disabled: boolean) => {
      const statFilters_ = structuredClone(statFilters)
      statFilters_[index].disabled = disabled
      setStatFilters(statFilters_)
    },
    [setStatFilters, statFilters]
  )
  const statFilterWithRead = useMemo(
    () =>
      statFilters.map(({ read, value, isMax, disabled }) => ({
        read,
        value,
        isMax,
        disabled,
      })),
    [statFilters]
  )

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {statFilterWithRead.map((statFilter, i) => (
        <OptimizationTargetEditorItem
          statFilter={statFilter}
          setTarget={(read: Read) => setTarget(read, i)}
          delTarget={() => delTarget(i)}
          setTargetValue={(val) => setTargetValue(i, val)}
          setTargetisMax={(isMax) => setTargetisMax(i, isMax)}
          setDisabled={(disabled) => setTargetDisabled(i, disabled)}
          disabled={disabled}
          key={i + JSON.stringify(statFilter)}
        />
      ))}
      <OptimizationTargetSelector
        setOptTarget={(target) => setTarget(target)}
      />
    </Box>
  )
}

function OptimizationTargetEditorItem({
  statFilter,
  setTarget,
  delTarget,
  setTargetValue,
  setTargetisMax,
  setDisabled,
  disabled,
}: {
  statFilter: UnArray<StatFilters>
  setTarget: (read: Read) => void
  delTarget: () => void
  setTargetValue: (value: number) => void
  setTargetisMax: (isMax: boolean) => void
  setDisabled: (disabled: boolean) => void
  disabled: boolean
}) {
  const { read, value, isMax, disabled: valueDisabled } = statFilter

  // TODO: best way to infer percentage from tag?
  const isPercent = (read.tag.name || read.tag.q)?.endsWith('_')
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ButtonGroup
        sx={{
          '& .MuiButtonGroup-grouped': { minWidth: 24 },
          width: '100%',
          flexGrow: 1,
        }}
      >
        <Button
          color={valueDisabled ? 'secondary' : 'success'}
          onClick={() => setDisabled(!valueDisabled)}
          disabled={disabled}
          size="small"
        >
          {valueDisabled ? <CheckBoxOutlineBlank /> : <CheckBox />}
        </Button>

        <OptimizationTargetSelector
          optTarget={read}
          setOptTarget={setTarget}
          buttonProps={{ sx: { flexGrow: 1 }, size: 'small' }}
        />
        <Button onClick={() => setTargetisMax(!isMax)} size="small">
          <strong>{isMax ? '<=' : '>='}</strong>
        </Button>
      </ButtonGroup>

      <NumberInputLazy
        float
        value={value}
        sx={{ flexBasis: 150, flexGrow: 1, height: '100%' }}
        disabled={disabled}
        onChange={setTargetValue}
        placeholder="Stat Value"
        size="small"
        inputProps={{ sx: { textAlign: 'right' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ ml: 0 }}>
              {isPercent ? '%' : undefined}{' '}
              <IconButton
                aria-label="Delete Stat Constraint"
                onClick={delTarget}
                edge="end"
              >
                <DeleteForever fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
