import {
  CardThemed,
  ColorText,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { isPercentStat, type UnArray } from '@genshin-optimizer/common/util'
import type { ElementWithPhyKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type {
  PandoStatFilterTag,
  PandoStatFilters,
} from '@genshin-optimizer/gi/db'
import {
  newPandoStatFilterTag,
  pandoStatFilterStatKeys,
  pandoStatFilterStatQtKeys,
  type PandoStatFilterStatKey,
} from '@genshin-optimizer/gi/db'
import { PandoOptConfigContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { TagDisplay, pandoCardSx } from '@genshin-optimizer/gi/formula-ui'
import type { StatKey } from '@genshin-optimizer/gi/keymap'
import { StatFilterTagToTag } from '@genshin-optimizer/gi/pando-solver'
import { StatWithUnit } from '@genshin-optimizer/gi/ui'
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
import { useTranslation } from 'react-i18next'

const qtMap: Record<(typeof pandoStatFilterStatQtKeys)[number], string> = {
  final: 'Final',
  premod: 'Premod',
  base: 'Base',
}

export function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation('page_optimize')
  const {
    optConfigId,
    optConfig: { statFilters },
  } = useContext(PandoOptConfigContext)

  const database = useDatabase()

  const setStatFilters = useCallback(
    (statFilters: PandoStatFilters) =>
      database.pandoOptConfigs.set(optConfigId, { statFilters }),
    [database, optConfigId]
  )
  return (
    <CardThemed bgt="light" sx={pandoCardSx}>
      <CardContent
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography sx={{ fontWeight: 'bold' }}>{t('statFilter')}</Typography>
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
  statFilters: PandoStatFilters
  setStatFilters: (statFilters: PandoStatFilters) => void
  disabled: boolean
}) {
  const setTarget = useCallback(
    (tag: PandoStatFilterTag, oldIndex?: number) => {
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
  const newTarget = (q: PandoStatFilterStatKey) =>
    setTarget(newPandoStatFilterTag(q))

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
  onSelect,
}: {
  onSelect: (key: PandoStatFilterStatKey) => void
}) {
  const { t } = useTranslation('page_optimize')
  return (
    <DropdownButton title={t('addStatFilter')}>
      {pandoStatFilterStatKeys.map((statKey) => (
        <MenuItem key={statKey} onClick={() => onSelect(statKey)}>
          <StatWithUnit statKey={statKey as StatKey} />
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
  statFilter: UnArray<PandoStatFilters>
  delTarget: () => void
  setTarget: (tag: PandoStatFilterTag) => void
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
          <TagDisplay tag={StatFilterTagToTag(tag)} />
        </Typography>
        <QtDropdown qt={tag.qt} setQt={(qt) => setTarget({ ...tag, qt })} />
        {tag.q === 'dmg_' && (
          <EleDropdown
            tag={tag}
            setEle={(ele) => {
              const { ele: _ele, ...rest } = tag
              setTarget(ele ? { ...rest, ele } : rest)
            }}
          />
        )}
        <Button onClick={() => setTargetisMax(!isMax)} size="small">
          <strong>{isMax ? 'MAX' : 'MIN'}</strong>
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

function EleDropdown({
  tag,
  setEle,
}: {
  tag: PandoStatFilterTag
  setEle: (ele: ElementWithPhyKey | null) => void
}) {
  const { t } = useTranslation('page_optimize')
  return (
    <DropdownButton
      title={
        tag.ele ? <ColorText color={tag.ele}>{tag.ele}</ColorText> : t('noEle')
      }
    >
      <MenuItem onClick={() => setEle(null)}>{t('noEle')}</MenuItem>
      {allElementWithPhyKeys.map((ele) => (
        <MenuItem key={ele} onClick={() => setEle(ele)}>
          <ColorText color={ele}>{ele}</ColorText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function QtDropdown({
  qt,
  setQt,
}: {
  qt: PandoStatFilterTag['qt']
  setQt: (qt: (typeof pandoStatFilterStatQtKeys)[number]) => void
}) {
  return (
    <DropdownButton title={qt && qtMap[qt]}>
      {pandoStatFilterStatQtKeys.map((q) => (
        <MenuItem
          key={q}
          onClick={() => setQt(q)}
          selected={qt === q}
          disabled={qt === q}
        >
          {qtMap[q]}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
