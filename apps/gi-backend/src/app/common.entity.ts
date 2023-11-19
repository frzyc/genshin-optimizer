import { allLocationCharacterKeys } from '@genshin-optimizer/consts'
import { objKeyMap } from '@genshin-optimizer/util'
import { registerEnumType } from '@nestjs/graphql'
export const LocationEnum = objKeyMap(allLocationCharacterKeys, (k) => k)

registerEnumType(LocationEnum, {
  name: 'LocationKey',
})
