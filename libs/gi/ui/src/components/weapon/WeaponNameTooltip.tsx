import { BootstrapTooltip, ImgIcon } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import { Skeleton, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'
import { WeaponName } from './WeaponTrans'

type Data = {
  weaponKey: WeaponKey
  addlText?: any
  children: ReactElement<any, any> & ReactNode
}
export function WeaponNameTooltip({ weaponKey, addlText, children }: Data) {
  const title = (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <Typography>
        <ImgIcon
          src={imgAssets.weaponTypes[getWeaponStat(weaponKey).weaponType]}
          size={1.5}
        />{' '}
        <WeaponName weaponKey={weaponKey} />
      </Typography>
      {addlText}
    </Suspense>
  )
  return (
    <BootstrapTooltip placement="top" title={title} disableInteractive>
      {children}
    </BootstrapTooltip>
  )
}
