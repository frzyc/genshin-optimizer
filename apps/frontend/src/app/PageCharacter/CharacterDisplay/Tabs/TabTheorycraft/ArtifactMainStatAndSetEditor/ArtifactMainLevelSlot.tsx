import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type {
  ArtifactRarity,
  ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { artMaxLevel, artSlotMainKeys } from '@genshin-optimizer/gi/consts'
import type { ICharTCArtifactSlot } from '@genshin-optimizer/gi/db'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import {
  artDisplayValue,
  getMainStatDisplayValue,
} from '@genshin-optimizer/gi/util'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { Box, MenuItem } from '@mui/material'
import { useCallback, useContext } from 'react'
import SlotIcon from '../../../../../Components/Artifact/SlotIcon'
import CardDark from '../../../../../Components/Card/CardDark'
import CustomNumberInput from '../../../../../Components/CustomNumberInput'
import DropdownButton from '../../../../../Components/DropdownMenu/DropdownButton'
import {
  StatColoredWithUnit,
  StatWithUnit,
} from '../../../../../Components/StatDisplay'
import Artifact from '../../../../../Data/Artifacts/Artifact'
import StatIcon from '../../../../../KeyMap/StatIcon'
import { CharTCContext } from '../CharTCContext'

export function ArtifactMainLevelSlot({
  slotKey,
  disabled = false,
}: {
  slotKey: ArtifactSlotKey
  disabled?: boolean
}) {
  const {
    charTC: {
      artifact: { slots },
    },
    setCharTC,
  } = useContext(CharTCContext)
  const { level, statKey, rarity } = slots[slotKey]
  const keys = artSlotMainKeys[slotKey]
  const setSlot = useCallback(
    (action: Partial<ICharTCArtifactSlot>) => {
      setCharTC((charTC) => {
        const slot = charTC.artifact.slots[slotKey]
        charTC.artifact.slots[slotKey] = { ...slot, ...action }
      })
    },
    [setCharTC, slotKey]
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
      <CardDark
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
            sx={{ px: 0 }}
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
      </CardDark>
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
      <CustomNumberInput
        startAdornment="+"
        value={level}
        color={Artifact.levelVariant(level)}
        onChange={(l) => l !== undefined && setSlot({ level: l })}
        sx={{ borderRadius: 1, pl: 1, my: 0, height: '100%' }}
        inputProps={{ sx: { pl: 0.5, width: '2em' }, max: 20, min: 0 }}
        disabled={disabled}
      />
      <CardDark sx={{ height: '100%', minWidth: '4em' }}>
        <Box p={1} textAlign="center">{`${artDisplayValue(
          getMainStatDisplayValue(statKey, rarity, level),
          KeyMap.unit(statKey)
        )}${KeyMap.unit(statKey)}`}</Box>
      </CardDark>
    </Box>
  )
}
