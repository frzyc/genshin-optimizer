import type { SubstatTypeKey } from '@genshin-optimizer/consts'
import { substatTypeKeys } from '@genshin-optimizer/consts'
import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { Box, MenuItem, Stack, Typography } from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import BootstrapTooltip from '../../../../../Components/BootstrapTooltip'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import ColorText from '../../../../../Components/ColoredText'
import DropdownButton from '../../../../../Components/DropdownMenu/DropdownButton'
import { CharTCContext } from '../CharTCContext'
import { ArtifactAllSubstatEditor } from './ArtifactAllSubstatEditor'
import { ArtifactSubstatEditor } from './ArtifactSubstatEditor'
export function ArtifactSubCard() {
  const { t } = useTranslation('page_character')
  const {
    charTC: {
      artifact: {
        substats: { type: substatsType, stats: substats },
      },
    },
    setCharTC,
  } = useContext(CharTCContext)
  const setSubstatsType = useCallback(
    (t: SubstatTypeKey) => {
      setCharTC((charTC) => {
        charTC.artifact.substats.type = t
      })
    },
    [setCharTC]
  )

  const rv =
    Object.entries(substats).reduce(
      (t, [k, v]) => t + v / getSubstatValue(k),
      0
    ) * 100
  const rolls = Object.entries(substats).reduce(
    (t, [k, v]) => t + v / getSubstatValue(k, undefined, substatsType),
    0
  )
  return (
    <CardLight sx={{ p: 1, height: '100%' }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DropdownButton
            sx={{ flexGrow: 1 }}
            title={t(`tabTheorycraft.substatType.${substatsType}`)}
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
          <BootstrapTooltip
            title={<Typography>{t`tabTheorycraft.maxTotalRolls`}</Typography>}
            placement="top"
          >
            <CardDark
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
              <ColorText color={rolls > 45 ? 'warning' : undefined}>
                Rolls: <strong>{rolls.toFixed(0)}</strong>
              </ColorText>
              <ColorText color={rolls > 45 ? 'warning' : undefined}>
                RV: <strong>{rv.toFixed()}%</strong>
              </ColorText>
            </CardDark>
          </BootstrapTooltip>
        </Box>
        <ArtifactAllSubstatEditor />
        {Object.entries(substats).map(([k]) => (
          <ArtifactSubstatEditor key={k} statKey={k} />
        ))}
      </Stack>
    </CardLight>
  )
}
