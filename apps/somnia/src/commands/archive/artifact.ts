import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { EmbedBuilder } from 'discord.js'
import { rarityColors } from '../../assets/assets'
import { createAmbrUrl } from '../../lib/util'
import { clean } from '../archive'

export function artifactArchive(id: ArtifactSetKey, name: string, data: any) {
  //artifact rarity color
  const rarities = getArtSetStat(id).rarities
  const rarity = rarities[rarities.length - 1]
  //set content
  let text = ''
  for (const e in data.setEffects) {
    if (e === '1') text += '**1-Piece:** '
    else text += `**${e}-Pieces** `
    text += `${data.setEffects[e]}\n`
  }
  const embed = new EmbedBuilder()
    .setTitle(name)
    .setColor(rarityColors[rarity - 1])
    .setFooter({
      text: 'Artifact Archive',
    })
    .setDescription(clean(text))
  const thumbnail = AssetData.artifacts[id].flower
  if (thumbnail) embed.setThumbnail(createAmbrUrl(thumbnail))

  return {
    content: '',
    embeds: [embed],
  }
}
