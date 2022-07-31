const chalk = require('chalk')
const config = require('../config/config')
const elicense = require("../utils/elicense")
const { glob } = require("glob")
const { promisify } = require("util")
const globPromise = promisify(glob);
const ms = require('ms')
const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

module.exports = async (client) => {
    console.log(chalk.yellow.bold('Commands ━━━━━━━━━━━━━━━━━━━━━━━━┓'))
    const commands = []
    const commandFiles = fs.readdirSync(`${process.cwd()}/bot/commands`).filter(file => file.endsWith('js'))
    for (const file of commandFiles) {
        const slash = require(`${process.cwd()}/bot/commands/${file}`)
        client.commands.set(slash.data.name, slash)
        commands.push(slash.data.toJSON())
        console.log(`${chalk.cyan.bold('┃')} Loaded: ✅ ${chalk.cyan.bold('┃')} ${file}`)
    }
    console.log(chalk.yellow.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    const rest = new REST({ version: '9' }).setToken(config.bot.token)

    try {
        console.log(chalk.cyan.bold('Events ━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
        const eventFiles = await globPromise(`${process.cwd()}/bot/events/*.js`);
        eventFiles.map((value) => {
            require(value);
            let eventName = value.split("/")[value.split("/").length - 1].split(".")[0];
            console.log(`${chalk.yellow.bold('┃')} Loaded: ✅ ${chalk.yellow.bold('┃')} ${eventName}`);
        });
        console.log(chalk.cyan.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    } catch (err) {
        console.log(err)
        console.log(chalk.red(`[!] The service will be exit because the system found a error`))
        process.exit(1)
    }

    client.on("ready", async () => {
        console.log(chalk.yellow.bold('Bot ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
        try {
            console.log(`${chalk.cyan.bold('┃')} Loaded: ✅ ${chalk.cyan.bold('┃')} ${client.user.tag}`)
        } catch (err) {
            console.log(err)
            console.log(chalk.red(`[!] The service will be exit because the system found a error`))
            process.exit(1)
        }
        try {
            if (config.bot.presence.enabled) {
                let pos = 0
                async function nextStatus() {
                    let status
                    if (pos > config.bot.presence.activities.length - 1) pos = 0
                    status = config.bot.presence.activities[pos]
                    pos++
                    client.user.setPresence({activities: [{ name: status, type: config.bot.presence.type }]})
                }
                nextStatus()
                setInterval(nextStatus, ms(config.bot.presence.interval))
            }
            console.log(`${chalk.cyan.bold('┃')} Loaded: ✅ ${chalk.cyan.bold('┃')} Presence`)
        } catch (err) {
            console.log(err)
            console.log(chalk.red(`[!] The service will be exit because the system found a error`))
            process.exit(1)
        }
        try {
            await rest.put(
                Routes.applicationCommands(client.user.id, config.bot.guild), {
                    body: commands
                    }
            )
            console.log(chalk.yellow.bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
        } catch (err) {
            console.log(err)
            console.log(chalk.red(`[!] The service will be exit because the system found a error`))
            process.exit(1)
        }
        elicense.initSystem()
    })
}