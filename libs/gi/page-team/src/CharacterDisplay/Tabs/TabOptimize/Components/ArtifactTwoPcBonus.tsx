import { TwoPcBonusList } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  type TwoPcStats,
  valueString,
} from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type {
  ArtSetExclusion,
  ArtSetExclusionKey,
} from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import type { StatKey } from '@genshin-optimizer/gi/keymap'
import { ArtifactSetName, StatWithUnit } from '@genshin-optimizer/gi/ui'
import {
  artifactTwoPcGroups,
  artifactTwoPcSets,
  elementalResBonus,
} from '@genshin-optimizer/gi/util'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export function ArtifactTwoPcBonus() {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const { artSetExclusion } = useOptConfig(optConfigId)!
  const allowlist = artifactTwoPcSets.filter(
    (set) => !artSetExclusion[set as ArtSetExclusionKey]?.includes(2)
  )
  return (
    <TwoPcBonusList
      title={t('artSetConfig.twoPieceBonus')}
      groups={artifactTwoPcGroups}
      allowlist={allowlist}
      universe={artifactTwoPcSets}
      onChange={(next) =>
        database.optConfigs.set(optConfigId, {
          artSetExclusion: allowlistToExclusion(artSetExclusion, next),
        })
      }
      label={(group) => (
        <TwoPcStatLabel stats={group.stats} setKey={group.sets[0]} />
      )}
      emptyMeansAll={false}
    />
  )
}

function TwoPcStatLabel({
  stats,
  setKey,
}: {
  stats?: TwoPcStats
  setKey: ArtifactSetKey
}) {
  if (!stats) return <ArtifactSetName setKey={setKey} />
  const elementalRes = elementalResBonus(stats)
  if (elementalRes !== undefined)
    return <>Elemental RES +{valueString(elementalRes, '%')}</>
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'center',
      }}
    >
      {Object.entries(stats).map(([stat, value]) => (
        <Box
          key={stat}
          component="span"
          sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}
        >
          <StatWithUnit statKey={stat as StatKey} />+
          {valueString(value, getUnitStr(stat))}
        </Box>
      ))}
    </Box>
  )
}

function allowlistToExclusion(
  exclusion: ArtSetExclusion,
  allowlist: readonly ArtifactSetKey[]
): ArtSetExclusion {
  const allowed = new Set(allowlist)
  const next: ArtSetExclusion = { ...exclusion }
  for (const set of artifactTwoPcSets) {
    const key = set as ArtSetExclusionKey
    const without2 = (next[key] ?? []).filter((num) => num !== 2)
    if (allowed.has(set)) {
      if (without2.length) next[key] = without2
      else delete next[key]
    } else next[key] = [...without2, 2]
  }
  return next
}
