exports.run = async (bannedMember, client) => {

    try {

        //Previene que continue la ejecución si el servidor no es el principal
        if (bannedMember.guild.id !== client.homeGuild.id) return;

        async function sendLogEmbed(executor, reason, time, days) {

            if (bannedMember.user.bot) {
                if (bannedMember.user.id === client.user.id) return;

                const loggingEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.warning)
                    .setTitle('📑 Registro - [BOTS]')
                    .setDescription(`El **BOT** <@${bannedMember.user.tag}> fue baneado del servidor.`);

                await client.channels.cache.get(client.config.main.loggingChannel).send({ embeds: [loggingEmbed] })
            } else {

                //Envía un mensaje al canal de registro
                await client.functions.loggingManager('embed', new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryError)
                    .setAuthor({ name: `${bannedMember.user.tag} ha sido BANEADO`, iconURL: bannedMember.user.displayAvatarURL({dynamic: true}) })
                    .addField('Miembro', bannedMember.user.tag, true)
                    .addField('ID', bannedMember.user.id, true)
                    .addField('Moderador', executor ? executor.tag : 'Desconocido', true)
                    .addField('Razón', reason || 'Indefinida', true)
                    .addField('Vencimiento', time ? `<t:${Math.round(new Date(parseInt(time)) / 1000)}:R>` : 'No vence', true)
                    .addField('Días de mensajes borrados', days || 'Ninguno', true)
                );
            };
        };

        const fetchedLogs = await bannedMember.guild.fetchAuditLogs({
            limit: 1,
            type: 'MEMBER_BAN_ADD',
        });

        const banLog = fetchedLogs.entries.first();

        if (!banLog) {
            return sendLogEmbed();
        } 
    
        let { executor, target, reason } = banLog;
        let time, days;
    
        if (target.id === bannedMember.user.id) {
            if (!reason) reason = 'Indefinida';

            if (reason.includes('Vencimiento: ')) time = reason.split('Vencimiento: ').pop().split(',')[0];
            if (reason.includes('Días de mensajes borrados: ')) days = reason.split('Días de mensajes borrados: ').pop().split(',')[0];
            if (reason.includes('Moderador: ')) executor = await client.users.fetch(reason.split(', ')[0].substring(11));
            if (reason.includes('Razón: ')) reason = reason.split('Razón: ').pop();

            sendLogEmbed(executor, reason, time, days);
        } else {
            sendLogEmbed();
        }

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildBanAdd');
    };
};
