import { AssetData } from '@genshin-optimizer/sr/assets-data'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { EmbedBuilder } from 'discord.js'
import { hsrURL } from '../../lib/util'
import { clean } from '../archive'

export function relicBank(id: RelicSetKey, name: string, data: any) {
  //set content
  let text = ''
  for (const e in data.setEffects) {
    if (e === '1') text += '**1-Piece:** '
    else text += `**${e}-Pieces** `
    text += `${data.setEffects[e]}\n`
  }
  const embed = new EmbedBuilder()
    .setTitle(name)
    .setFooter({
      text: 'Relic Databank',
    })
    .setDescription(clean(text))
  const relic = AssetData.relics[id]
  let thumbnail = ''
  if ('sphere' in relic) thumbnail = relic.sphere
  else if ('head' in relic) thumbnail = relic.head
  if (thumbnail) embed.setThumbnail(hsrURL('relic', thumbnail))

  return {
    content: '',
    embeds: [embed],
  }
}
