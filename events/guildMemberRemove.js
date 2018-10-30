exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== `374945492133740544`) return;

        if (!event.user.bot) {
            console.log(`${new Date().toUTCString()} 》@${event.user.tag} abandonó la guild: ${event.guild.name}`);

            let embed = new discord.RichEmbed()
                .setColor(resources.orange)
                .setThumbnail(`https://image.ibb.co/nn7X50/outbox-tray.png`)
                .setAuthor(`Un miembro abandonó`, event.user.displayAvatarURL)
                .setDescription(`${event.user.username} abandonó el servidor`)
                .addField(`🏷 TAG completo`, event.user.tag, true)
                .addField(`🆔 ID del usuario`, event.user.id, true);
            
            await bot.channels.get(config.loggingChannel).send(embed);
        } else {
            if (event.user.id === bot.user.id) return;
            let loggingGoodbyeBotEmbed = new discord.RichEmbed()
                .setColor(resources.orange)
                .addField(`📤 Auditoría`, `El **BOT** @${event.user.tag} fue eliminado del servidor`);
            
            await bot.channels.get(config.loggingChannel).send(loggingGoodbyeBotEmbed)
        }
    } catch (e) {
        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.RichEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildMemberRemove`, true)
            .addField(`Fecha:`, new Date().toUTCString(), true)
            .addField(`Error:`, e.stack, true)
            .setFooter(new Date().toUTCString(), resources.server.iconURL).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.get(config.debuggingChannel).send(debuggEmbed);
    }
}
