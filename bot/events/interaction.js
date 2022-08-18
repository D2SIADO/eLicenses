const client = require("../../index");
const { MessageEmbed } = require('discord.js')
const config = require('../../config/config')
const chalk = require('chalk')

client.on('interactionCreate', async(interaction) => {
    if (!interaction.isCommand()) return
  
    const commands = client.commands.get(interaction.commandName)
  
    if (!commands) return

    if (commands.permission) {
      const authorPerms = interaction.channel.permissionsFor(interaction.member)
      if(!authorPerms || !authorPerms.has(commands.permission)) return interaction.reply({
        embeds: [ new MessageEmbed()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            }).setTitle('No permissions').setColor('RED')
            .setDescription(`${"`❌`"} You need the permission '${commands.permission}' to execute the command`)
            .setFooter({
                text: config.name,
                iconURL: config.bot.icon
            })
            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
            .setTimestamp()]
    , ephemeral: true})
    }
    if(commands.role) {
      const member = interaction.member
      if (!member.roles.cache.has(commands.role)) return interaction.reply({
        embeds: [ new MessageEmbed()
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.avatarURL()
            }).setTitle('No permissions').setColor('RED')
            .setDescription(`${"`❌`"} You need the role <@&${commands.role}> to execute the command`)
            .setFooter({
                text: config.name,
                iconURL: config.bot.icon
            })
            .setImage(`https://i.ibb.co/QjxPpsZ/Red.png`)
            .setTimestamp()]
    , ephemeral: true})
    }
  
    try {
      await commands.run(client, interaction)
    } catch (err) {
      console.log(err)
      console.log(chalk.red(`[!] The service will be exit because the system found a error`))
      process.exit(1)
    }
})