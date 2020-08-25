exports.run = async (event, discord, fs, config, keys, bot, resources) => {
    
    try {

        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (event.guild.id !== `374945492133740544`) return;

        async function sendLogEmbed(executor, reason) {
            if (event.user.bot) {
                if (event.user.id === bot.user.id) return;
                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.orange)
                    .addField(`📤 Auditoría`, `El **BOT** @${event.user.tag} fue expulsado del servidor`);
                
                await bot.channels.cache.get(config.loggingChannel).send(loggingEmbed)
            } else {
                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.red2)
                    .setAuthor(`${event.user.tag} ha sido EXPULSADO`, event.user.displayAvatarURL())
                    .addField(`Miembro`, `<@${event.user.id}>`, true)
                    .addField(`Moderador`, `<@${executor.id || 'Desconocido'}>`, true)
                    .addField(`Razón`, reason || 'Desconocida', true);

                await bot.channels.cache.get(config.loggingChannel).send(loggingEmbed)
            }
        }
        
        const fetchedLogs = await event.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        const kickLog = fetchedLogs.entries.first();
        
        if (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000))) {
        
            let { executor, target, reason } = kickLog;

            if (!reason) reason = `Indefinida`
        
            if (target.id === event.user.id) {
                console.log(`${new Date().toLocaleString()} 》${event.user.tag} fue expulsado de ${event.guild.name} por ${executor.tag} debido a ${reason}.`);
                sendLogEmbed(executor, reason);
            } else {
                console.log(`${new Date().toLocaleString()} 》${event.user.tag} left the guild, audit log fetch was inconclusive.`);
                sendLogEmbed();
            }
        } else {

            const fetchedBans = await event.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            if (fetchedBans.entries.first() && (fetchedBans.entries.first().createdTimestamp > (Date.now() - 5000))) return;

            console.log(`${new Date().toLocaleString()} 》${event.user.tag} abandonó la guild: ${event.guild.name}.`);

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(resources.orange)
                .setThumbnail(event.user.displayAvatarURL())
                .setAuthor(`Un miembro abandonó`, `https://i.imgur.com/2nZ23V4.png`)
                .setDescription(`${event.user.username} abandonó el servidor`)
                .addField(`🏷 TAG completo`, event.user.tag, true)
                .addField(`🆔 ID del usuario`, event.user.id, true)
                .setFooter(event.guild.name, event.guild.iconURL()).setTimestamp()
            
            return await bot.channels.cache.get(config.loggingChannel).send(loggingEmbed);
        }
    } catch (e) {

        console.log(e);

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildMemberRemove`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``)
            .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
