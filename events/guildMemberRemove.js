exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== `374945492133740544`) return;

        const fetchedLogs = await event.guild.fetchAuditLogs({
            limit: 1
        })

        const log = fetchedLogs.entries.first();
        let { action, executor, reason } = log;
    
        if (log && (action === `MEMBER_KICK` || action === `MEMBER_BAN_ADD`)) {

            if (!reason) reason = `Indefinida`

            let loggingEmbed;

            if (action === `MEMBER_KICK`) {
                loggingEmbed = new discord.RichEmbed()
                    .setColor(resources.red2)
                    .setAuthor(`${event.user.tag} ha sido EXPULSADO`, event.user.displayAvatarURL)
                    .addField(`Miembro`, `<@${event.user.id}>`, true)
                    .addField(`Moderador`, `<@${executor.id}>`, true)
                    .addField(`Razón`, reason, true)
            } else if (action === `MEMBER_BAN_ADD`) {

                if (reason.includes('Duración')) {

                    const time = reason.split('Duración: ').pop().split(',')[0];
                    reason = reason.split('Razón: ').pop();

                    loggingEmbed = new discord.RichEmbed()
                        .setColor(resources.red2)
                        .setAuthor(`${event.user.tag} ha sido BANEADO`, event.user.displayAvatarURL)
                        .addField(`Miembro`, `<@${event.user.id}>`, true)
                        .addField(`Moderador`, `<@${executor.id}>`, true)
                        .addField(`Razón`, reason, true)
                        .addField(`Duración`, time, true);
                } else {
                    loggingEmbed = new discord.RichEmbed()
                        .setColor(resources.red2)
                        .setAuthor(`${event.user.tag} ha sido BANEADO`, event.user.displayAvatarURL)
                        .addField(`Miembro`, `<@${event.user.id}>`, true)
                        .addField(`Moderador`, `<@${executor.id}>`, true)
                        .addField(`Razón`, reason, true)
                        .addField(`Duración`, `∞`, true);
                }
            } else {
                return console.log(`${new Date().toLocaleString()} 》Ocurrió un error durante la ejecución del evento 'guildMemberRemove'`);
            }

            await bot.channels.get(config.loggingChannel).send(loggingEmbed);
            
        } else {
            if (!event.user.bot) {
                console.log(`${new Date().toLocaleString()} 》@${event.user.tag} abandonó la guild: ${event.guild.name}`);
    
                let embed = new discord.RichEmbed()
                    .setColor(resources.orange)
                    .setThumbnail(`https://i.imgur.com/2nZ23V4.png`)
                    .setAuthor(`Un miembro abandonó`, event.user.displayAvatarURL)
                    .setDescription(`${event.user.username} abandonó el servidor`)
                    .addField(`🏷 TAG completo`, event.user.tag, true)
                    .addField(`🆔 ID del usuario`, event.user.id, true)
                    .setFooter(event.guild.name, event.guild.iconURL).setTimestamp()
                
                await bot.channels.get(config.loggingChannel).send(embed);
            } else {
                if (event.user.id === bot.user.id) return;
                let loggingGoodbyeBotEmbed = new discord.RichEmbed()
                    .setColor(resources.orange)
                    .addField(`📤 Auditoría`, `El **BOT** @${event.user.tag} fue eliminado del servidor`);
                
                await bot.channels.get(config.loggingChannel).send(loggingGoodbyeBotEmbed)
            }
        }
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
