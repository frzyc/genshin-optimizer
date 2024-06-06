/* eslint-disable @typescript-eslint/no-var-requires */
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} from 'discord.js'
import * as fs from 'fs'
import * as path from 'path'
import { clientid, token } from './config.json'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
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

//collect commands
export const Commands: Collection<string, any> = new Collection()
const setcommands: any[] = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.match(/\.[tj]s$/))
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file))
  if ('slashcommand' in command && 'run' in command) {
    Commands.set(command.slashcommand.name, command)
    setcommands.push(command.slashcommand.toJSON())
    console.log(`/${file} loaded`)
  } else {
    console.log(`/${file} couldn't load`)
  }
}

//register commands
const rest = new REST().setToken(token)
rest
  .put(Routes.applicationCommands(clientid), { body: setcommands })
  .then((data: any) => console.log(`Reloaded ${(data as any).length} commands`))
  .catch((e: any) => console.log(e))

client.login(token)
