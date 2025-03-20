import {
  CardThemed,
  ColorText,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { type UnArray, isPercentStat } from '@genshin-optimizer/common/util'
import type { AttributeKey } from '@genshin-optimizer/zzz/consts'
import { allAttributeKeys } from '@genshin-optimizer/zzz/consts'
import type { StatFilterTag } from '@genshin-optimizer/zzz/db'
import {
  type StatFilterStatKey,
  type StatFilters,
  newStatFilterTag,
  statFilterStatKeys,
} from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { TagDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import {
  CheckBox,
  CheckBoxOutlineBlank,
  DeleteForever,
} from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Typography,
} from '@mui/material'
import { useCallback, useContext } from 'react'

export function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const {
    optConfigId,
    optConfig: { statFilters },
  } = useContext(OptConfigContext)

  const { database } = useDatabaseContext()

  const setStatFilters = useCallback(
    (statFilters: StatFilters) =>
      database.optConfigs.set(optConfigId, { statFilters }),
    [database, optConfigId]
  )
  return (
    <CardThemed bgt="light">
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <Box display="flex" justifyContent="space-between">
          {/* TODO: Translate */}
          <Typography sx={{ fontWeight: 'bold' }}>Stat Filter</Typography>
          {/* <InfoTooltip
              title={<Typography>{t('constraintFilter.tooltip')}</Typography>}
            /> */}
        </Box>
      </CardContent>
      <Divider />
      <CardContent>
        <StatFilterDisplay
          statFilters={statFilters}
          setStatFilters={setStatFilters}
          disabled={disabled}
        />
      </CardContent>
    </CardThemed>
  )
}

export function StatFilterDisplay({
  statFilters,
  setStatFilters,
  disabled = false,
}: {
  statFilters: StatFilters
  setStatFilters: (statFilters: StatFilters) => void
  disabled: boolean
}) {
  const setTarget = useCallback(
    (tag: StatFilterTag, oldIndex?: number) => {
      const statFilters_ = structuredClone(statFilters)
      if (typeof oldIndex === 'undefined')
        statFilters_.push({
          tag,
          value: 0,
          isMax: false,
          disabled: false,
        })
      else statFilters_[oldIndex].tag = tag
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
  const newTarget = (q: StatFilterStatKey) => setTarget(newStatFilterTag(q))

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {statFilters.map((statFilter, i) => (
        <StatFilterItem
          statFilter={statFilter}
          delTarget={() => delTarget(i)}
          setTarget={(tag) => setTarget(tag, i)}
          setTargetValue={(val) => setTargetValue(i, val)}
          setTargetisMax={(isMax) => setTargetisMax(i, isMax)}
          setDisabled={(disabled) => setTargetDisabled(i, disabled)}
          disabled={disabled}
          key={i + JSON.stringify(statFilter)}
        />
      ))}
      <InitialStatDropdown onSelect={newTarget} />
    </Box>
  )
}

function InitialStatDropdown({
  tag,
  onSelect,
}: {
  tag?: Tag
  onSelect: (key: (typeof statFilterStatKeys)[number]) => void
}) {
  return (
    <DropdownButton
      title={(tag && <TagDisplay tag={tag} />) ?? 'Add Final Stat Filter'}
    >
      {statFilterStatKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          <StatDisplay statKey={statKey} showPercent />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function StatFilterItem({
  statFilter,
  delTarget,
  setTarget,
  setTargetValue,
  setTargetisMax,
  setDisabled,
  disabled,
}: {
  statFilter: UnArray<StatFilters>
  delTarget: () => void
  setTarget: (tag: StatFilterTag) => void
  setTargetValue: (value: number) => void
  setTargetisMax: (isMax: boolean) => void
  setDisabled: (disabled: boolean) => void
  disabled: boolean
}) {
  const { tag, value, isMax, disabled: valueDisabled } = statFilter

  const isPercent = isPercentStat(tag.q ?? '')
  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button
          color={valueDisabled ? 'secondary' : 'success'}
          onClick={() => setDisabled(!valueDisabled)}
          disabled={disabled}
          size="small"
        >
          {valueDisabled ? <CheckBoxOutlineBlank /> : <CheckBox />}
        </Button>
        <Typography>
          <TagDisplay tag={tag} />
        </Typography>
        {tag.q === 'dmg_' && (
          <AttributeDropdown
            tag={tag}
            setAttribute={(ele) => {
              const { attribute, ...rest } = tag
              setTarget(ele ? { ...rest, attribute: ele } : rest)
            }}
          />
        )}
        <Button onClick={() => setTargetisMax(!isMax)} size="small">
          <strong>{isMax ? '<=' : '>='}</strong>
        </Button>

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
      </CardContent>
    </CardThemed>
  )
}
function AttributeDropdown({
  tag,
  setAttribute,
}: {
  tag: Tag
  setAttribute: (ele: AttributeKey | null) => void
}) {
  return (
    <DropdownButton
      title={
        tag.attribute ? (
          <AttributeName attribute={tag.attribute} />
        ) : (
          'No Attribute'
        )
      }
      color={tag.attribute!}
    >
      <MenuItem onClick={() => setAttribute(null)}>No Attribute</MenuItem>
      {allAttributeKeys.map((attr) => (
        <MenuItem key={attr} onClick={() => setAttribute(attr)}>
          <ColorText color={attr}>
            <AttributeName attribute={attr} />
          </ColorText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
