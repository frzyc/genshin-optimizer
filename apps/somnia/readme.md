# somnia

A discord bot for Genshin Optimizer

Commands:

- `/button` - Sends a button that increases a counter when pressed, used to test that bot is working as well as its response time
- `/archive` - Queries a database of characters, weapons, and artifacts in Genshin Impact
- `/databank` - Queries a database of characters, weapons, and artifacts in Star Rail

# Running the bot

Create `src/config.json` in the following format:

```
{
  "token": "<insert-discord-bot-token>",
  "clientid": "<insert-bot-user-id>"
}
```

Then to start the bot run:

```
nx serve somnia
```
