import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import { conditionals } from '@genshin-optimizer/sr/formula'

const sheet: UISheet = {
  documents: [
    {
      type: 'conditional',
      conditional: {
        tag: conditionals.Serval.boolConditional.tag,
        fields: [
          {
            fieldRef: '',
          },
        ],
      },
    },
  ],
}

export default sheet
