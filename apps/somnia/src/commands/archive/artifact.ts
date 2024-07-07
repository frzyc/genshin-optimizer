import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { getArtSetStat } from '@genshin-optimizer/gi/stats'
import { AssetData } from '@genshin-optimizer/gi/assets-data'
import type { Interaction } from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { clean } from '../archive'
import { rarityColors } from '../../assets/assets'

export function artifactarchive(
  interaction: Interaction,
  id: ArtifactSetKey,
  name: string,
  data: any
) {
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
    .setTitle(data.setName)
    .setColor(rarityColors[rarity - 1])
    .setFooter({
      text: 'Artifact Archive',
    })
    .setDescription(clean(text))
    .setThumbnail(`https://api.ambr.top/assets/UI/reliquary/${AssetData.artifacts[id].flower}.png`)

  return {
    content: '',
    embeds: [embed],
  }
}
