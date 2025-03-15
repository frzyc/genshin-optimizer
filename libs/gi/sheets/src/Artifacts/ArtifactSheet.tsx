import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { artifactDefIcon } from '@genshin-optimizer/gi/assets'
import type { ArtifactSetKey, SetNum } from '@genshin-optimizer/gi/consts'
import type { Data } from '@genshin-optimizer/gi/wr'
import { st, trans } from '../SheetUtil'
import type { IDocumentHeader } from '../sheet'
import type { SetEffectEntry, SetEffectSheet } from './IArtifactSheet'

export class ArtifactSheet {
  readonly sheet: SetEffectSheet
  readonly data: Data
  constructor(sheet: SetEffectSheet, data: Data) {
    this.sheet = sheet
    this.data = data
  }
  get setEffects(): Partial<Record<SetNum, SetEffectEntry>> {
    return this.sheet
  }
  setEffectDocument = (setNum: SetNum) => this.sheet[setNum]?.document
}

export const setHeaderTemplate = (
  setKey: ArtifactSetKey,
): ((setNum: SetNum) => IDocumentHeader) => {
  const [tr] = trans('artifact', setKey)
  return (setNum: SetNum) => ({
    title: tr('setName'),
    icon: <ImgIcon size={2} src={artifactDefIcon(setKey)} />,
    action: <SqBadge color="success">{st(`${setNum}set`)}</SqBadge>,
    description: tr(`setEffects.${setNum}`),
  })
}
