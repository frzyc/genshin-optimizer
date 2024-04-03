import { BootstrapTooltip, ImgIcon } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { getWeaponStat } from '@genshin-optimizer/gi/stats'
import { WeaponName } from '@genshin-optimizer/gi/ui'
import { Skeleton, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'

type Data = {
  weaponKey: WeaponKey
  addlText?: any
  children: ReactElement<any, any> & ReactNode
}
export default function WeaponNameTooltip({
  weaponKey,
  addlText,
  children,
}: Data) {
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
