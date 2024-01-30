import type { Document } from '@genshin-optimizer/pando-ui-sheet'
import type { SetCondCallback } from './ConditionalDisplay'
import { ConditionalDisplay } from './ConditionalDisplay'
export function DocumentDisplay({
  document,
  setCond,
}: {
  document: Document
  setCond: SetCondCallback
}) {
  switch (document.type) {
    case 'conditional':
      return <ConditionalDisplay condDoc={document} setCond={setCond} />
    default:
      return <>not yet</>
  }
}
