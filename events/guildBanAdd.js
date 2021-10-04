exports.run = async (guild, user, client, discord) => {

    try {
        //Previene que continue la ejecución si el servidor no es el principal
        if (guild.id !== client.homeGuild.id) return;

        async function sendLogEmbed(executor, reason, time, days) {
            if (user.bot) {
                if (user.id === client.user.id) return;

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle('📑 Auditoría - [BOTS]')
                    .setDescription(`El **BOT** <@${event.user.tag}> fue baneado del servidor.`);

                await client.channels.cache.get(client.config.guild.loggingChannel).send({ embeds: [loggingEmbed] })
            } else {
                let moderador = executor;
                let razon = reason || 'Indefinida';

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.config.colors.error)
                    .setAuthor(`${user.tag} ha sido BANEADO`, user.displayAvatarURL({dynamic: true}))
                    .addField('Miembro', user.tag, true)
                    .addField('ID', user.id, true)
                    .addField('Moderador', moderador.tag || 'Desconocido', true)
                    .addField('Razón', razon || 'Indefinida', true)
                    .addField('Duración', time || 'Indefinida', true)
                    .addField('Días de mensajes borrados', days || 'Ninguno', true);

                await client.channels.cache.get(client.config.guild.loggingChannel).send({ embeds: [loggingEmbed] })
            }
        }

        const fetchedLogs = await guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        const banLog = fetchedLogs.entries.first();

        if (!banLog) {
            return sendLogEmbed();
        } 
    
        let { executor, target, reason } = banLog;
        let time = '∞'
        let days;
    
        if (target.id === user.id) {
            if (!reason) reason = 'Indefinida';

            if (reason.includes('Duración: ')) time = reason.split('Duración: ').pop().split(',')[0];
            if (reason.includes('Días de mensajes borrados: ')) days = reason.split('Días de mensajes borrados: ').pop().split(',')[0];
            if (reason.includes('Moderador: ')) executor = await client.users.fetch(reason.split(', ')[0].substring(11));
            if (reason.includes('Razón: ')) reason = reason.split('Razón: ').pop();

            sendLogEmbed(executor, reason, time, days);
        } else {
            sendLogEmbed();
        }

    } catch (error) {

        await client.functions.eventErrorHandler(error, 'guildBanAdd');
    };
};
