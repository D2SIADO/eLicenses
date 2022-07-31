const config = require('./config/config')
const {Client, Collection} = require('discord.js')

const client = new Client({
    intents: 32767
})
module.exports = client

client.commands = new Collection()

require("./bot")(client)

client.login(config.bot.token)