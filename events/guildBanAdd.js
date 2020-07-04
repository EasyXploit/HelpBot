exports.run = async (guild, user, discord, fs, config, keys, bot, resources) => {

    try {
        //Previene que continue la ejecución si el servidor no es la República Gamer
        if (guild.id !== `374945492133740544`) return;

        async function sendLogEmbed(executor, reason, time) {
            if (user.bot) {
                if (user.id === bot.user.id) return;

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.orange)
                    .addField(`📤 Auditoría`, `El **BOT** <@${user.tag}> fue baneado del servidor`);

                await bot.channels.cache.get(config.loggingChannel).send(loggingEmbed)
            } else {
                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(resources.red2)
                    .setAuthor(`${user.tag} ha sido BANEADO`, user.displayAvatarURL())
                    .addField(`Miembro`, `<@${user.id}>`, true)
                    .addField(`Moderador`, `<@${executor.id || 'Desconocido'}>`, true)
                    .addField(`Razón`, reason || 'Desconocida', true)
                    .addField(`Duración`, time || 'Desconocida', true);

                await bot.channels.cache.get(config.loggingChannel).send(loggingEmbed)
            }
        }

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        const banLog = fetchedLogs.entries.first();

        if (!banLog) {
            console.log(`${new Date().toLocaleString()} 》${user.tag} fue baneado en ${guild.name} pero no se encontró un registro de auditoría que lo corrobore.`);
            return sendLogEmbed();
        } 
    
        let { executor, target, reason } = banLog;
        let time = '∞'
    
        if (target.id === user.id) {
            if (!reason) reason = `Indefinida`

            if (reason.includes('Duración')) {
                time = reason.split('Duración: ').pop().split(',')[0];
                reason = reason.split('Razón: ').pop();
            }

            console.log(`${new Date().toLocaleString()} 》${user.tag} fue baneado en ${guild.name} por ${executor.tag} durante ${time} por ${reason}.`);
            sendLogEmbed(executor, reason, time);
        } else {
            console.log(`${new Date().toLocaleString()} 》${user.tag} fue baneado de ${guild.name} pero la búsqueda de un registro en la auditoría fue inconcluyente.`);
            sendLogEmbed();
        }

    } catch (e) {
        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(resources.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildBanAdd`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, e.stack, true)
            .setFooter(new Date().toLocaleString(), resources.server.iconURL()).setTimestamp();
        
        //Se envía el mensaje al canal de depuración
        await bot.channels.cache.get(config.debuggingChannel).send(debuggEmbed);
    }
}
