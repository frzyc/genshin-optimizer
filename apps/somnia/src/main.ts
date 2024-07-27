import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from 'discord.js'
import { readFileSync } from 'fs'
// So we can modify config.json after building, thereby not exposing credentials in our build drop
const { clientid, token } = JSON.parse(
  readFileSync('./apps/somnia/src/config.json').toString()
)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

import * as events from './lib/events'
//ready
client.on(Events.ClientReady, (...args) => events.ready(...args))
//interactions
client.on(Events.InteractionCreate, (...args) =>
  events.interactionCreate(...args)
)
//reactions
client.on(Events.MessageReactionAdd, (...args) =>
  events.messageReactionAdd(...args)
)

//collect commands
import * as archive from './commands/archive'
import * as button from './commands/button'
// TODO: Enable after i18n of databank
// import * as databank from './commands/databank'
export const Commands: Collection<string, any> = new Collection()
Commands.set(archive.slashcommand.name, archive)
// Commands.set(databank.slashcommand.name, databank)
Commands.set(button.slashcommand.name, button)
const setcommands = [
  archive.slashcommand.toJSON(),
  // databank.slashcommand.toJSON(),
  button.slashcommand.toJSON(),
]

//register commands
const rest = new REST().setToken(token)
rest
  .put(Routes.applicationCommands(clientid), { body: setcommands })
  .then((data: any) => console.log(`Reloaded ${(data as any).length} commands`))
  .catch((e: any) => console.log(e))

client.login(token)
