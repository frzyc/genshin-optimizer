import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type {
  ArtifactRarity,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { artMaxLevel, artSlotMainKeys } from '@genshin-optimizer/gi/consts'
import type { BuildTcArtifactSlot } from '@genshin-optimizer/gi/db'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { SlotIcon, StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  StatColoredWithUnit,
  StatWithUnit,
  artifactLevelVariant,
} from '@genshin-optimizer/gi/ui'
import {
  artDisplayValue,
  getMainStatDisplayValue,
} from '@genshin-optimizer/gi/util'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, MenuItem } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import { useCallback, useContext } from 'react'
import { BuildTcContext } from '../../../../BuildTcContext'

export function ArtifactMainLevelSlot({
  slotKey,
  disabled = false,
}: {
  slotKey: ArtifactSlotKey
  disabled?: boolean
}) {
  const {
    buildTc: {
      artifact: { slots },
    },
    setBuildTc,
  } = useContext(BuildTcContext)
  const { level, statKey, rarity } = slots[slotKey]
  const keys = artSlotMainKeys[slotKey]
  const setSlot = useCallback(
    (action: Partial<BuildTcArtifactSlot>) => {
      setBuildTc((buildTc) => {
        const slot = buildTc.artifact.slots[slotKey]
        buildTc.artifact.slots[slotKey] = { ...slot, ...action }
      })
    },
    [setBuildTc, slotKey]
  )
  const setRarity = useCallback(
    (r: ArtifactRarity) => {
      const mLvl = artMaxLevel[r] ?? 0
      if (level > mLvl) setSlot({ rarity: r, level: mLvl })
      else setSlot({ rarity: r })
    },
    [level, setSlot]
  )

  return (
    <Box
      display="flex"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <SlotIcon slotKey={slotKey} />
      <CardThemed
        sx={{ height: '100%', minWidth: '5em', flexGrow: 1, display: 'flex' }}
      >
        {keys.length === 1 ? (
          <Box
            p={1}
            justifyContent="center"
            alignItems="center"
            width="100%"
            display="flex"
            gap={1}
          >
            <StatIcon statKey={keys[0]} iconProps={iconInlineProps} />{' '}
            {KeyMap.getStr(keys[0])}
          </Box>
        ) : (
          <DropdownButton
            sx={{ px: '0.5rem' }}
            fullWidth
            title={<StatWithUnit statKey={statKey} />}
            color={KeyMap.getVariant(statKey) ?? 'success'}
            disabled={disabled}
          >
            {keys.map((msk) => (
              <MenuItem
                key={msk}
                disabled={statKey === msk}
                onClick={() => setSlot({ statKey: msk })}
              >
                <StatColoredWithUnit statKey={msk} />
              </MenuItem>
            ))}
          </DropdownButton>
        )}
      </CardThemed>
      <DropdownButton
        sx={{ px: 0 }}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {rarity} <StarRoundedIcon fontSize="inherit" />
          </Box>
        }
        disabled={disabled}
      >
        {[5, 4, 3].map((r) => (
          <MenuItem
            key={r}
            disabled={rarity === r}
            onClick={() => setRarity(r as ArtifactRarity)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {r} <StarRoundedIcon fontSize="inherit" />
            </Box>
          </MenuItem>
        ))}
      </DropdownButton>
      <NumberInputLazy
        value={level}
        onChange={(l) => l !== undefined && setSlot({ level: l })}
        color={artifactLevelVariant(level)}
        size="small"
        inputProps={{
          sx: { width: '2ch' },
          max: 20,
          min: 0,
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start">+</InputAdornment>,
        }}
        focused
      />
      <CardThemed sx={{ height: '100%', minWidth: '4em' }}>
        <Box p={1} textAlign="center">{`${artDisplayValue(
          getMainStatDisplayValue(statKey, rarity, level),
          getUnitStr(statKey)
        )}${getUnitStr(statKey)}`}</Box>
      </CardThemed>
    </Box>
  )
}
