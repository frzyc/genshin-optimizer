import { shouldShowDevComponents } from '@genshin-optimizer/common-util'
import type { Read } from '@genshin-optimizer/game-opt-engine'
import { DebugReadContext } from '@genshin-optimizer/game-opt-formula-ui'
import {
  FieldDisplayList,
  TagFieldDisplay,
} from '@genshin-optimizer/game-opt-sheet-ui'
import type { StatKey } from '@genshin-optimizer/zzz-consts'
import { applyDamageTypeToTag } from '@genshin-optimizer/zzz-db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz-db'
import { useCharacterContext, useTeam } from '@genshin-optimizer/zzz-db-ui'
import type { Tag } from '@genshin-optimizer/zzz-formula'
import { own } from '@genshin-optimizer/zzz-formula'
import {
  StatHighlightContext,
  ZCard,
  getHighlightRGBA,
  isHighlight,
} from '@genshin-optimizer/zzz-ui'
import { ListItem } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useZzzCalcContext } from '../hooks'
import { tagToTagField } from '../util'

export function CharStatsDisplay() {
  const calc = useZzzCalcContext()
  return (
    <ZCard>
      <FieldDisplayList sx={{ m: 0 }} bgt="normal">
        {calc?.listFormulas(own.listing.formulas).map((read, index) => (
          <CharStatRow key={index} read={read} />
        ))}
      </FieldDisplayList>
    </ZCard>
  )
}

function CharStatRow({ read }: { read: Read<Tag> }) {
  const { setRead } = useContext(DebugReadContext)
  const character = useCharacterContext()
  const team = useTeam(character?.key)
  const optTarget = team ? getTeamFrame0(team).tag : undefined

  const mergedTag = useMemo(() => {
    if (
      read.tag.sheet === optTarget?.sheet &&
      read.tag.name === optTarget?.name
    )
      return applyDamageTypeToTag(
        read.tag,
        optTarget?.damageType1,
        optTarget?.damageType2
      )
    return read.tag
  }, [
    read.tag,
    optTarget?.sheet,
    optTarget?.name,
    optTarget?.damageType1,
    optTarget?.damageType2,
  ])

  const calcRead = useMemo(() => read.withTag(mergedTag), [mergedTag, read])

  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const tagQStatKey = mergedTag.name
    ? ''
    : mergedTag.attribute
      ? `${mergedTag.attribute}_${mergedTag.q}`
      : mergedTag.q === 'cappedCrit_'
        ? 'crit_'
        : mergedTag.q === 'anom_cappedCrit_'
          ? 'anom_crit_'
          : mergedTag.q
  const isHL = tagQStatKey
    ? isHighlight(statHighlight, tagQStatKey as StatKey)
    : false

  return (
    <TagFieldDisplay
      field={tagToTagField(mergedTag)}
      calcRead={calcRead}
      showZero
      component={ListItem}
      onMouseEnter={() => tagQStatKey && setStatHighlight(tagQStatKey)}
      onMouseLeave={() => setStatHighlight('')}
      rowSx={{
        position: 'relative',
        '::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: getHighlightRGBA(isHL),
          transition: 'background-color 0.3s ease-in-out',
          pointerEvents: 'none',
        },
      }}
      onClickFormula={
        shouldShowDevComponents ? () => setRead(calcRead) : () => {}
      }
    />
  )
}
