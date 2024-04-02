import { validateLightCone } from '@genshin-optimizer/sr/db'
import type { ILightCone } from '@genshin-optimizer/sr/srod'

type ResetMessage = { type: 'reset' }
type OverwriteMessage = { type: 'overwrite'; lightCone: ILightCone }
type UpdateMessage = { type: 'update'; lightCone: Partial<ILightCone> }
type Message = ResetMessage | OverwriteMessage | UpdateMessage

export function lightConeReducer(
  state: ILightCone | undefined,
  action: Message
): ILightCone | undefined {
  const handle = () => {
    switch (action.type) {
      case 'reset':
        return undefined
      case 'overwrite':
        return action.lightCone
      case 'update':
        return { ...state!, ...action.lightCone }
    }
  }
  const lc = handle()
  if (!lc) return lc
  return validateLightCone(lc)
}
