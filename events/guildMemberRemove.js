exports.run = async (event, client, discord) => {
    
    try {

        //Previene que continue la ejecución si el servidor no es el principal
        if (event.guild.id !== client.homeGuild.id) return;

        async function sendLogEmbed(executor, reason) {
            if (event.user.bot) {
                if (event.user.id === client.user.id) return;
                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.orange)
                    .setTitle('📑 Auditoría - [BOTS]')
                    .setDescription(`El **BOT** @${event.user.tag} fue expulsado del servidor.`);
                
                await client.channels.cache.get(client.config.guild.loggingChannel).send(loggingEmbed)
            } else {
                let moderador = executor;
                let razon = reason || 'Indefinida';

                if (reason.includes('Moderador: ')) {
                    moderador = await client.users.fetch(reason.split(', ')[0].substring(11));
                    razon = reason.split(', Razón: ')[1];
                }

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.red)
                    .setAuthor(`${event.user.tag} ha sido EXPULSADO`, event.user.displayAvatarURL({dynamic: true}))
                    .addField('Miembro', `<@${event.user.id}>`, true)
                    .addField('Moderador', moderador.tag || 'Desconocido', true)
                    .addField('Razón', razon || 'Indefinida', true);

                await client.channels.cache.get(client.config.guild.loggingChannel).send(loggingEmbed)
            }
        }
        
        const fetchedLogs = await event.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        const kickLog = fetchedLogs.entries.first();
        
        if (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000))) {
        
            let { executor, target, reason } = kickLog;

            if (!reason) reason = 'Indefinida'
        
            if (target.id === event.user.id) {
                sendLogEmbed(executor, reason);
            } else {
                sendLogEmbed();
            }
        } else {

            const fetchedBans = await event.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            if (fetchedBans.entries.first() && (fetchedBans.entries.first().createdTimestamp > (Date.now() - 5000))) return;

            let loggingEmbed = new discord.MessageEmbed()
                .setColor(client.colors.orange)
                .setThumbnail(event.user.displayAvatarURL({dynamic: true}))
                .attachFiles(new discord.MessageAttachment('./resources/images/out.png', 'out.png'))
                .setAuthor('Un miembro abandonó', 'attachment://out.png')
                .setDescription(`${event.user.username} abandonó el servidor`)
                .addField('🏷 TAG completo', event.user.tag, true)
                .addField('🆔 ID del miembro', event.user.id, true);
            
            return await client.channels.cache.get(client.config.guild.joinsAndLeavesChannel).send(loggingEmbed);
        }
    } catch (error) {
        if (event.user.id === client.user.id) return;
        await client.functions.eventErrorHandler(error, 'guildMemberRemove');
    };
};
