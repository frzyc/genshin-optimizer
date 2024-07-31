# somnia

A discord bot for Genshin Optimizer

Commands:

- `/button` - Sends a button that increases a counter when pressed, used to test that bot is working as well as its response time
- `/archive` - Queries a database of characters, weapons, and artifacts in Genshin Impact
- `/databank` - Queries a database of characters, weapons, and artifacts in Star Rail

# Running the bot

Copy `src/config.empty.json` to `src/config.json` and fill out the contents:

```
{
  "token": "<insert-discord-bot-token>",
  "clientid": "<insert-bot-user-id>"
}
```

For more information, see https://discord.com/developers/docs/quick-start/getting-started#step-1-creating-an-app

Then to start the bot run:

```
nx serve somnia
```
