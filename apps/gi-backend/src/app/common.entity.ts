import { objKeyMap } from '@genshin-optimizer/common/util'
import { allLocationCharacterKeys } from '@genshin-optimizer/gi/consts'
import { registerEnumType } from '@nestjs/graphql'
export const LocationEnum = objKeyMap(allLocationCharacterKeys, (k) => k)

registerEnumType(LocationEnum, {
  name: 'LocationKey',
})
