const client = require("../../index");
const chalk = require('chalk')

client.on('interactionCreate', async(interaction) => {
    if (!interaction.isCommand()) return
  
    const commands = client.commands.get(interaction.commandName)
  
    if (!commands) return
  
    if (commands.permission) {
      const authorPerms = interaction.channel.permissionsFor(interaction.member)
      if(!authorPerms || !authorPerms.has(commands.permission)) {
        return interaction.reply( { content: `${"'❌'"} You need the perm ${commands.permission} to execute the command`})
      }
    }
  
    try {
      await commands.run(client, interaction)
    } catch (err) {
      console.log(err)
      console.log(chalk.red(`[!] The service will be exit because the system found a error`))
      process.exit(1)
    }
})