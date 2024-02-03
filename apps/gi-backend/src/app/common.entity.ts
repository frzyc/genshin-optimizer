import { objKeyMap } from '@genshin-optimizer/common_util'
import { allLocationCharacterKeys } from '@genshin-optimizer/gi_consts'
import { registerEnumType } from '@nestjs/graphql'
export const LocationEnum = objKeyMap(allLocationCharacterKeys, (k) => k)

registerEnumType(LocationEnum, {
  name: 'LocationKey',
})
