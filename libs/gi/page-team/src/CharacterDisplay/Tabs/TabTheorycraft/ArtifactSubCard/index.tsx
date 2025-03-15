import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
  DropdownButton,
} from '@genshin-optimizer/common/ui'
import type {
  ArtifactRarity,
  SubstatTypeKey,
} from '@genshin-optimizer/gi/consts'
import {
  artSubstatRollData,
  substatTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { ArtifactRarityDropdown } from '@genshin-optimizer/gi/ui'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import { Box, MenuItem, Stack, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BuildTcContext } from '../../../../BuildTcContext'
import { ArtifactAllSubstatEditor } from './ArtifactAllSubstatEditor'
import { ArtifactSubstatEditor } from './ArtifactSubstatEditor'

export function ArtifactSubCard({
  maxTotalRolls,
  disabled = false,
}: {
  maxTotalRolls: number
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character')
  const {
    buildTc: {
      artifact: {
        substats: { type: substatsType, stats: substats, rarity },
      },
    },
    setBuildTc,
  } = useContext(BuildTcContext)
  const setSubstatsType = useCallback(
    (t: SubstatTypeKey) => {
      setBuildTc((charTC) => {
        charTC.artifact.substats.type = t
      })
    },
    [setBuildTc],
  )
  const setRarity = useCallback(
    (r: ArtifactRarity) => {
      setBuildTc((charTC) => {
        charTC.artifact.substats.rarity = r
      })
    },
    [setBuildTc],
  )

  const rv =
    Object.entries(substats).reduce(
      (t, [k, v]) => t + v / getSubstatValue(k),
      0,
    ) * 100
  const rolls = Object.entries(substats).reduce(
    (t, [k, v]) => t + v / getSubstatValue(k, rarity, substatsType),
    0,
  )
  const { high, numUpgrades } = artSubstatRollData[rarity]
  const maxRolls = (high + numUpgrades) * 5
  return (
    <CardThemed bgt="light" sx={{ p: 1, height: '100%' }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DropdownButton
            sx={{ flexGrow: 1 }}
            title={t(`tabTheorycraft.substatType.${substatsType}`)}
            disabled={disabled}
          >
            {substatTypeKeys.map((st) => (
              <MenuItem
                key={st}
                disabled={substatsType === st}
                onClick={() => setSubstatsType(st)}
              >
                {t(`tabTheorycraft.substatType.${st}`)}
              </MenuItem>
            ))}
          </DropdownButton>
          <ArtifactRarityDropdown
            rarity={rarity}
            onChange={(r) => setRarity(r)}
            filter={(r) => r !== rarity}
            disabled={disabled}
          />
          <BootstrapTooltip
            title={
              <Typography>
                <Trans t={t} i18nKey={'tabTheorycraft.maxTotalRolls'}>
                  {'The current build can only have a maximum of '}
                  <strong>{{ value: maxTotalRolls } as any}</strong>
                  {' rolls.'}
                </Trans>
              </Typography>
            }
            placement="top"
          >
            <CardThemed
              sx={{
                textAlign: 'center',
                py: 0.5,
                px: 1,
                whiteSpace: 'nowrap',
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexShrink: 1,
              }}
            >
              <ColorText color={rolls > maxRolls ? 'error' : undefined}>
                Rolls: <strong>{rolls.toFixed(0)}</strong>
              </ColorText>
              <ColorText color={rolls > maxRolls ? 'error' : undefined}>
                RV: <strong>{rv.toFixed()}%</strong>
              </ColorText>
            </CardThemed>
          </BootstrapTooltip>
        </Box>
        <ArtifactAllSubstatEditor disabled={disabled} />
        {Object.entries(substats).map(([k]) => (
          <ArtifactSubstatEditor key={k} statKey={k} disabled={disabled} />
        ))}
      </Stack>
    </CardThemed>
  )
}
