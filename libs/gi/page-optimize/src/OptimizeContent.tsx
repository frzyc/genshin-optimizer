import {
  FormulaModal,
  OptimizeChrome,
} from '@genshin-optimizer/gi/page-team/experiment-ui'
import { Skeleton } from '@mui/material'
import { Suspense } from 'react'

export default function OptimizeContent({ tab }: { tab?: string }) {
  const activeTab = tab ?? 'overview'

  return (
    <>
      <FormulaModal />
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={500} />}
      >
        <OptimizeChrome flow="experiment" tab={activeTab} />
      </Suspense>
    </>
  )
}
