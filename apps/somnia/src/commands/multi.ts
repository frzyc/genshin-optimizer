import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
} from 'discord.js'
import { ChannelType, SlashCommandBuilder } from 'discord.js'

export const slashcommand = new SlashCommandBuilder()
  .setName('multi')
  .setDescription('get multi-target forum link')
  .addStringOption((o) =>
    o
      .setName('name')
      .setDescription('Character name')
      .setAutocomplete(true)
      .setRequired(true)
  )

const multioptThread = '1035231314074411008'
const multilist: Record<string, string> = {}
const cacheDuration = 1000 * 60 * 60
let cacheTime = Date.now() - cacheDuration

async function getMultis(client: Client) {
  const now = Date.now()
  if (now - cacheTime > cacheDuration) {
    cacheTime = now
    const channel = await client.channels.fetch(multioptThread)
    if (channel && channel.type == ChannelType.GuildForum) {
      const activeThreads = (await channel.threads.fetchActive()).threads
      const inactiveThreads = (await channel.threads.fetchArchived()).threads
      activeThreads.forEach((thread, id) => {
        multilist[thread.name] = id
      })
      inactiveThreads.forEach((thread, id) => {
        multilist[thread.name] = id
      })
    }
    delete(multilist['Guidelines'])
    console.log('refreshing multi-opt cache')
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  await getMultis(interaction.client)

  const focus = interaction.options.getFocused(true)
  let reply: ApplicationCommandOptionChoiceData[] = []

  if (focus.name === 'name') {
    const text = focus.value.toLowerCase()
    reply = Object.keys(multilist)
      .filter((e) => e.toLowerCase().includes(text))
      .slice(0, 25)
      .sort()
      .map((e) => {
        return { name: e, value: e }
      })
  }

  interaction.respond(reply)
}

const threadLink = 'https://discord.com/channels/785153694478893126/'

export async function run(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name', true)
  const threadId = multilist[name]
  if (threadId) {
    interaction.reply(`[${name} multi-opts](${threadLink}${threadId})`)
  } else {
    interaction.reply({ content: 'Unknown Character', ephemeral: true })
  }
}
