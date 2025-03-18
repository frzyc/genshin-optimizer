import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { FieldDisplayList } from '@genshin-optimizer/game-opt/sheet-ui'
import { statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { getCharStat, getCharacterStats } from '@genshin-optimizer/zzz/stats'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, ListItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const coreStatMap = {
  'Base ATK': 'atk_base',
  Impact: 'impact',
  'CRIT Rate': 'crit_',
  'CRIT DMG': 'crit_dmg_',
  'Base Energy Regen': 'base_enerRegen',
  'Anomaly Proficiency': 'anomProf',
  'Anomaly Mastery': 'anomMas_base',
  'PEN Ratio': 'pen_',
} as const

export function CharacterCardStats({
  bgt,
  character,
}: {
  bgt?: CardBackgroundColor
  character: ICachedCharacter
}) {
  const { t } = useTranslation('page_characters')
  const { key, level, core } = character
  const characterStats = getCharacterStats(key, level, core)
  const characterStat = getCharStat(key)
  const stats = [
    'anomMas_base',
    'anomProf',
    'atk_base',
    'crit_',
    'crit_dmg_',
    'def_base',
    'hp_base',
  ]
  const coreStat = [
    ...new Set(characterStat.coreStats.flatMap(Object.keys)),
  ][1] as (typeof coreStatMap)[keyof typeof coreStatMap]

  return (
    <FieldDisplayList bgt={bgt} sx={{ width: '100%', borderRadius: 0 }}>
      {stats.map((stat: string) => (
        <ListItem key={stat}>
          <SubstatDisplay
            substat={stat}
            value={characterStats[stat]}
          />
        </ListItem>
      ))}

      <ListItem sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography flexGrow={1}>
          <strong>{t('characterCard.coreStat')}</strong>
        </Typography>
        {core ? (
          <SubstatDisplay
            substat={coreStat}
            value={characterStat.coreStats[core - 1][coreStat]}
          />
        ) : (
          <Typography>
            <strong>{t('characterCard.notUnlocked')}</strong>
          </Typography>
        )}
      </ListItem>
    </FieldDisplayList>
  )
}

function SubstatDisplay({
  substat,
  value,
}: {
  substat: string
  value: number | undefined
}) {
  if (!value) return null
  const displayValue = toPercent(value, substat).toFixed(
    statKeyToFixed(substat)
  )
  return (
    <Typography
      variant="subtitle2"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StatIcon statKey={substat} iconProps={iconInlineProps} />
        {statKeyTextMap[substat]}
      </Box>
      <span>
        {displayValue}
        {getUnitStr(substat)}
      </span>
    </Typography>
  )
}
