exports.run = async (guild, user, client, discord) => {

    try {
        //Previene que continue la ejecución si el servidor no es el principal
        if (guild.id !== client.homeGuild.id) return;

        async function sendLogEmbed(executor, reason, time, days) {
            if (user.bot) {
                if (user.id === client.user.id) return;

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.orange)
                    .setTitle('📑 Auditoría - [BOTS]')
                    .setDescription(`El **BOT** <@${event.user.tag}> fue baneado del servidor.`);

                await client.channels.cache.get(client.config.guild.loggingChannel).send(loggingEmbed)
            } else {
                let moderador = executor;
                let razon = reason || 'Indefinida';

                const loggingEmbed = new discord.MessageEmbed()
                    .setColor(client.colors.red)
                    .setAuthor(`${user.tag} ha sido BANEADO`, user.displayAvatarURL())
                    .addField(`Miembro`, user.tag, true)
                    .addField(`ID`, user.id, true)
                    .addField(`Moderador`, `${moderador.tag || 'Desconocido'}`, true)
                    .addField(`Razón`, razon || 'Indefinida', true)
                    .addField(`Duración`, time || 'Indefinida', true)
                    .addField(`Días de mensajes borrados`, days || 'Ninguno', true);

                await client.channels.cache.get(client.config.guild.loggingChannel).send(loggingEmbed)
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

    } catch (e) {

        let error = e.stack;
        if (error.length > 1014) error = error.slice(0, 1014);
        error = error + ' ...';

        //Se muestra el error en el canal de depuración
        let debuggEmbed = new discord.MessageEmbed()
            .setColor(client.colors.brown)
            .setTitle(`📋 Depuración`)
            .setDescription(`Se declaró un error durante la ejecución de un evento`)
            .addField(`Evento:`, `guildBanAdd`, true)
            .addField(`Fecha:`, new Date().toLocaleString(), true)
            .addField(`Error:`, `\`\`\`${error}\`\`\``);
        
        //Se envía el mensaje al canal de depuración
        await client.debuggingChannel.send(debuggEmbed);
    };
};
