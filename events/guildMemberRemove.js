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
                .setAuthor('Un miembro abandonó', 'https://i.imgur.com/2nZ23V4.png')
                .setDescription(`${event.user.username} abandonó el servidor`)
                .addField('🏷 TAG completo', event.user.tag, true)
                .addField('🆔 ID del miembro', event.user.id, true);
            
            return await client.channels.cache.get(client.config.guild.loggingChannel).send(loggingEmbed);
        }
    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = `${error.slice(0, 1014)} ...`;

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle('📋 Depuración')
            .setDescription('Se declaró un error durante la ejecución de un evento')
            .addField('Evento:', 'guildMemberRemove', true)
            .addField('Fecha:', new Date().toLocaleString(), true)
            .addField('Error:', `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};
