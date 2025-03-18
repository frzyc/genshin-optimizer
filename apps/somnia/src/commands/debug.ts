import process = require('node:process')
import type { ChatInputCommandInteraction } from 'discord.js'
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { readFile, stat } from 'node:fs/promises'

export const slashcommand = new SlashCommandBuilder()
  .setName('debug')
  .setDescription('build information')

async function read(path: string) {
  try {
    const data = await readFile(path)
    return Buffer.from(data).toString().trim()
  } catch {
    return ''
  }
}

const base = 'https://github.com/frzyc/genshin-optimizer'

export async function run(interaction: ChatInputCommandInteraction) {
  const mainstat = await stat(`${__dirname}/main.js`)
  const buildtime = Math.floor(mainstat.mtime.getTime() / 1000)
  const uptime = Math.floor(Date.now() / 1000 - process.uptime())
  let text = `build: <t:${buildtime}:R>\n` + `up: <t:${uptime}:R>\n`

  const ref = await read(`${__dirname}/ref`)
  if (ref) text += `ref: [\`${ref}\`](<${base}/commit/${ref}>)\n`

  const pr = await read(`${__dirname}/prNumber`)
  if (pr) text += `pr: [\`#${pr}\`](<${base}/pull/${pr}>)\n`

  const embed = new EmbedBuilder()
  embed.setDescription(text)
  return interaction.reply({ content: '', embeds: [embed] })
}
