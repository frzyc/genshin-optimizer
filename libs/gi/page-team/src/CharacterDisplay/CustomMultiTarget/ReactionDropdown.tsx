import { DropdownButton } from '@genshin-optimizer/common/ui'
import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAmpReactionKeys,
  allowedAdditiveReactions,
  allowedAmpReactions,
} from '@genshin-optimizer/gi/consts'
import {
  AdditiveReactionModeText,
  AmpReactionModeText,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function ReactionDropdown({
  node,
  reaction,
  setReactionMode,
  infusionAura,
}: {
  node: CalcResult
  reaction?: AmpReactionKey | AdditiveReactionKey
  setReactionMode: (r?: AmpReactionKey | AdditiveReactionKey) => void
  infusionAura?: InfusionAuraElementKey
}) {
  const ele = node.info.variant ?? 'physical'
  const { t } = useTranslation(['page_character', 'loadout'])

  if (
    !['pyro', 'hydro', 'cryo', 'electro', 'dendro'].some(
      (e) => e === ele || e === infusionAura
    )
  )
    return null
  const reactions = [
    ...new Set([
      ...((allowedAmpReactions as any)[ele] ?? []),
      ...((allowedAmpReactions as any)[infusionAura ?? ''] ?? []),
      ...((allowedAdditiveReactions as any)[ele] ?? []),
      ...((allowedAdditiveReactions as any)[infusionAura ?? ''] ?? []),
    ]),
  ]
  const title = reaction ? (
    ([...allAmpReactionKeys] as string[]).includes(reaction) ? (
      <AmpReactionModeText reaction={reaction as AmpReactionKey} />
    ) : (
      <AdditiveReactionModeText reaction={reaction as AdditiveReactionKey} />
    )
  ) : (
    t('noReaction')
  )
  return (
    <DropdownButton title={title} sx={{ ml: 'auto' }}>
      <MenuItem value="" disabled={!reaction} onClick={() => setReactionMode()}>
        {t('loadout:mTargetEditor.noReaction')}
      </MenuItem>
      {reactions.map((rm) => (
        <MenuItem
          key={rm}
          disabled={reaction === rm}
          onClick={() => setReactionMode(rm)}
        >
          {([...allAmpReactionKeys] as string[]).includes(rm) ? (
            <AmpReactionModeText reaction={rm} />
          ) : (
            <AdditiveReactionModeText reaction={rm} />
          )}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
