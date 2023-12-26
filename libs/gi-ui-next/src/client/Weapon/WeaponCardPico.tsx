import type { AscensionKey } from '@genshin-optimizer/consts'
import { weaponAsset } from '@genshin-optimizer/gi-assets'
import { CalcContext } from '@genshin-optimizer/gi-formula-ui'
import type { Weapon } from '@genshin-optimizer/gi-frontend-gql'
import { allStats } from '@genshin-optimizer/gi-stats'
import { IconStatDisplay } from '@genshin-optimizer/gi-ui'
import { getLevelString } from '@genshin-optimizer/gi-util'
import { read } from '@genshin-optimizer/pando'
import { CardThemed, SqBadge } from '@genshin-optimizer/ui-common'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import { useContext } from 'react'
import { assetWrapper } from '../util'
import WeaponNameTooltip from './WeaponNameTooltip'

export function WeaponCardPico({ weapon }: { weapon: Weapon }) {
  const { calc } = useContext(CalcContext)
  const { key: weaponKey, level, ascension } = weapon

  const atkVal = calc
    ? calc.compute(
        read(
          {
            member: 'member0',
            src: 'KeyOfKhajNisut',
            qt: 'base',
            q: 'atk',
            et: 'self',
          },
          'sum'
        )
      ).val
    : 0

  const tooltipAddl = (
    <Box>
      <IconStatDisplay statKey="atk" value={atkVal} />
      {/* TODO: weapon secondary stat */}
      {/* <WeaponStatPico node={UIData.get(input.weapon.sub)} /> */}
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
