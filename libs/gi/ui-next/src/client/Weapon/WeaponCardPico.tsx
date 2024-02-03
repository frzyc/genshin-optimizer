import { CardThemed, SqBadge } from '@genshin-optimizer/common_ui'
import { toPercent } from '@genshin-optimizer/common_util'
import type {
  AscensionKey,
  MainStatKey,
  SubstatKey,
} from '@genshin-optimizer/gi_consts'
import { weaponAsset } from '@genshin-optimizer/gi_assets'
import { convert, selfTag } from '@genshin-optimizer/gi_formula'
import { CalcContext } from '@genshin-optimizer/gi_formula-ui'
import type { Weapon } from '@genshin-optimizer/gi_frontend-gql'
import { allStats } from '@genshin-optimizer/gi_stats'
import { IconStatDisplay } from '@genshin-optimizer/gi_ui'
import { getLevelString } from '@genshin-optimizer/gi_util'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import { useContext } from 'react'
import { assetWrapper } from '../util'
import WeaponNameTooltip from './WeaponNameTooltip'

export function WeaponCardPico({ weapon }: { weapon: Weapon }) {
  const { calc } = useContext(CalcContext)
  const { key: weaponKey, level, ascension } = weapon

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  const listing = calc
    ?.listFormulas(member0.listing.specialized)
    .filter(({ tag }) => tag.src === 'KeyOfKhajNisut')
  // console.log({ listing, value: listing!.map((l) => calc?.compute(l)) })
  const mainStatRead = listing?.find(({ tag: { qt } }) => qt === 'base')
  const mainStatVal = mainStatRead && calc ? calc.compute(mainStatRead).val : 0

  const subStatRead = listing?.find(({ tag: { qt } }) => qt === 'premod')
  const subStatVal = subStatRead && calc ? calc.compute(subStatRead).val : 0
  const subStatKey = subStatRead ? subStatRead.tag.q : ''

  const refStatRead = listing?.find(
    ({ tag: { qt } }) => qt === 'weaponRefinement'
  )
  const refStatVal = refStatRead && calc ? calc.compute(refStatRead).val : 0
  const refStatKey = refStatRead ? refStatRead.tag.q : ''

  const tooltipAddl = (
    <Box>
      <IconStatDisplay statKey="atk" value={mainStatVal} />
      {subStatKey && (
        <IconStatDisplay
          statKey={subStatKey as MainStatKey | SubstatKey}
          value={toPercent(subStatVal, subStatKey)}
        />
      )}
      {refStatKey && (
        <IconStatDisplay
          statKey={refStatKey as MainStatKey | SubstatKey}
          value={toPercent(refStatVal, refStatKey)}
        />
      )}
    </Box>
  )
  const rarity = allStats.weapon.data[weaponKey].rarity

  return (
    <CardThemed
      sx={{
        // height: '100%',
        maxWidth: 128,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignContent="flex-end"
        className={`grad-${rarity}star`}
      >
        <WeaponNameTooltip weaponKey={weaponKey} addlText={tooltipAddl}>
          <Image
            src={assetWrapper(weaponAsset(weapon.key, weapon.ascension >= 2))}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              height: 'auto',
              width: '100%',
              objectPosition: 'right',
            }}
            alt="" //TODO:
          />
        </WeaponNameTooltip>
      </Box>
      <Typography
        sx={{
          position: 'absolute',
          fontSize: '0.75rem',
          lineHeight: 1,
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      >
        <strong>
          <SqBadge color="primary">
            {getLevelString(level, ascension as AscensionKey)}
          </SqBadge>
        </strong>
      </Typography>
      {rarity > 2 && (
        <Typography
          sx={{
            position: 'absolute',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: 'none',
            bottom: 0,
            right: 0,
          }}
        >
          <strong>
            <SqBadge color="secondary">R{weapon.refinement}</SqBadge>
          </strong>
        </Typography>
      )}
    </CardThemed>
  )
}
