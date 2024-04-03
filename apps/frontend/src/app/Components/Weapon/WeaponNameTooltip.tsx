import { BootstrapTooltip, ImgIcon } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { WeaponSheet } from '@genshin-optimizer/gi/sheets'
import { Skeleton, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { Suspense } from 'react'

type Data = {
  sheet: WeaponSheet
  addlText?: any
  children: ReactElement<any, any> & ReactNode
}
export default function WeaponNameTooltip({ sheet, addlText, children }: Data) {
  const title = (
    <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <Typography>
        <ImgIcon src={imgAssets.weaponTypes[sheet.weaponType]} size={1.5} />{' '}
        {sheet.name}
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
