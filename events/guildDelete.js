exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {
        console.log(`${new Date().toLocaleString()} 》${bot.user.username} abandonó la guild: ${event.name}`)

        let debuggingEmbed = new discord.RichEmbed()
            .setColor(resources.orange)
            .setThumbnail(event.iconURL)
            .setAuthor(`${bot.user.username} abandonó una guild`, bot.user.displayAvatarURL)
            .addField(`🏷 Nombre`, event.name, true)
            .addField(`🆔 ID`, event.id, true)
            .setTimestamp();

        await bot.channels.get(config.debuggingChannel).send(debuggingEmbed);
    } catch (e) {
        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.RichEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildMemberRemove`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, e.stack, true)
            .setFooter(new Date().toLocaleString(), resources.server.iconURL).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.get(config.debuggingChannel).send(debuggEmbed);
    }
}
