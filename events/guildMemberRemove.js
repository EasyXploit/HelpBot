exports.run = async (member, client) => {
    
    try {

        //Previene que continue la ejecución si el servidor no es el principal
        if (member.guild.id !== client.homeGuild.id) return;

        async function sendLogEmbed(executor, reason) {
            if (member.user.bot) {
                if (member.user.id === client.user.id) return;
                const loggingEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle('📑 Registro - [BOTS]')
                    .setDescription(`El **BOT** @${member.user.tag} fue expulsado del servidor.`);
                
                await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [loggingEmbed] })
            } else {
                let moderador = executor;
                let razon = reason || 'Indefinida';

                if (reason.includes('Moderador: ')) {
                    moderador = await client.users.fetch(reason.split(', ')[0].substring(11));
                    razon = reason.split(', Razón: ')[1];
                }

                const loggingEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor({ name: `${member.user.tag} ha sido EXPULSADO`, iconURL: member.user.displayAvatarURL({dynamic: true}) })
                    .addField('ID', member.user.id, true)
                    .addField('Moderador', moderador.tag || 'Desconocido', true)
                    .addField('Razón', razon || 'Indefinida', true);

                await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [loggingEmbed] })
            }
        }
        
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_KICK',
        });

        const kickLog = fetchedLogs.entries.first();
        
        if (kickLog && (kickLog.createdTimestamp > (Date.now() - 5000))) {
        
            let { executor, target, reason } = kickLog;

            if (!reason) reason = 'Indefinida'
        
            if (target.id === member.user.id) {
                sendLogEmbed(executor, reason);
            } else {
                sendLogEmbed();
            }
        } else {

            const fetchedBans = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_ADD',
            });

            if (fetchedBans.entries.first() && (fetchedBans.entries.first().createdTimestamp > (Date.now() - 5000))) return;

            let loggingEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.warning)
                .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
                .setAuthor({ name: 'Un miembro abandonó', iconURL: 'attachment://out.png' })
                .setDescription(`${member.user.tag} abandonó el servidor`)
                .addField('🆔 ID del miembro', member.user.id, true)     
                .addField('📝 Fecha de registro', `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)
            
            return await client.channels.cache.get(client.config.main.joinsAndLeavesChannel).send({ embeds: [loggingEmbed], files: ['./resources/images/out.png'] });
        }
    } catch (error) {

        //Ignora si fue el propio bot el que fue expulsado
        if (member.user.id === client.user.id) return;

        //Ejecuta el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildMemberRemove');
    };
};
