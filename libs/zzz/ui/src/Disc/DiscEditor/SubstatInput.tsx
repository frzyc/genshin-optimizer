import {
  CardThemed,
  ColorText,
  DropdownButton,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, range, valueString } from '@genshin-optimizer/common/util'
import type { DiscRarityKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSubStatKeys,
  discSubstatRollData,
  getDiscSubStatBaseVal,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import type { ISubstat } from '@genshin-optimizer/zzz/zood'
import type { SliderProps } from '@mui/material'
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatDisplay } from '../../Character'

// TODO: validation, roll validation across the disc, display text, icons, ...
export default function SubstatInput({
  rarity,
  index,
  disc,
  setSubstat,
}: {
  rarity: DiscRarityKey
  index: number
  disc: Partial<ICachedDisc>
  setSubstat: (index: number, substat?: ISubstat) => void
}) {
  const { t } = useTranslation('disc')
  const { mainStatKey = '' } = disc ?? {}
  const { key, upgrades = 0 } = disc?.substats?.[index] ?? {}
  const isEnabled =
    index === 0 || disc?.substats?.[index - 1]?.key !== undefined

  const marks = useMemo(
    () =>
      range(1, discSubstatRollData[rarity].numUpgrades + 1).map((i) => ({
        value: i,
      })),
    [rarity],
  )
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }} gap={1}>
      <DropdownButton
        // startIcon={key ? <StatIcon statKey={key} /> : undefined}
        title={
          key ? (
            <StatDisplay statKey={key} showPercent disableIcon />
          ) : (
            t('editor.substat.substatFormat', { value: index + 1 })
          )
        }
        disabled={!disc?.mainStatKey || !isEnabled}
        color={key ? 'success' : 'primary'}
        sx={{ whiteSpace: 'nowrap', width: '13em' }}
      >
        {key && (
          <MenuItem onClick={() => setSubstat(index)}>
            {t('editor.substat.noSubstat')}
          </MenuItem>
        )}
        {allDiscSubStatKeys
          .filter((key) => mainStatKey !== key)
          .map((k) => (
            <MenuItem
              key={k}
              selected={key === k}
              disabled={key === k}
              onClick={() => setSubstat(index, { key: k, upgrades: 1 })}
            >
              <ListItemIcon>
                <StatIcon statKey={k} />
              </ListItemIcon>
              <ListItemText>
                <StatDisplay statKey={k} showPercent disableIcon />
              </ListItemText>
            </MenuItem>
          ))}
      </DropdownButton>
      <CardThemed
        bgt="light"
        sx={{
          // px: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
          height: '100%',
          width: '2em',
        }}
      >
        {!!upgrades && (
          <ColorText color={upgrades - 1 ? 'warning' : undefined}>
            +{upgrades - 1}
          </ColorText>
        )}
      </CardThemed>
      <CardThemed
        sx={{
          flexGrow: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          overflow: 'visible',
          height: '100%',
        }}
      >
        <SliderWrapper
          value={upgrades}
          marks={marks}
          setValue={(v) => {
            key && setSubstat(index, { key, upgrades: v })
          }}
          disabled={!key}
          valueLabelFormat={(v) =>
            `${
              key &&
              valueString(
                v * getDiscSubStatBaseVal(key, rarity),
                getUnitStr(key),
              )
            }`
          }
        />
      </CardThemed>
      <CardThemed
        bgt="light"
        sx={{
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          height: '100%',
          width: '4em',
        }}
      >
        <Typography>
          {key &&
            valueString(
              (upgrades || 1) * getDiscSubStatBaseVal(key, rarity),
              getUnitStr(key),
            )}
        </Typography>
      </CardThemed>
    </Stack>
  )
}
function SliderWrapper({
  value,
  setValue,
  marks,
  disabled = false,
  valueLabelFormat,
}: {
  value: number
  setValue: (v: number) => void
  marks: Array<{ value: number }>
  disabled: boolean
  valueLabelFormat: SliderProps['valueLabelFormat']
}) {
  const [innerValue, setinnerValue] = useState(value)
  useEffect(() => setinnerValue(value), [value])
  return (
    <Slider
      value={innerValue}
      step={null}
      disabled={disabled}
      marks={marks}
      min={marks[0]?.value ?? 0}
      max={marks[marks.length - 1]?.value ?? 0}
      onChange={(_e, v) => setinnerValue(v as number)}
      onChangeCommitted={(_e, v) => setValue(v as number)}
      valueLabelDisplay="auto"
      valueLabelFormat={valueLabelFormat}
    />
  )
}
