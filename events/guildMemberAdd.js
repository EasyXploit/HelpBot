exports.run = async (event, client) => {
    
    try {
        //Previene que continue la ejecución si el servidor no es el principal
        if (event.guild.id !== client.homeGuild.id) return;

        if (!event.user.bot) {
            const forbiddenNames = ['http://', 'https://', 'discord.gg', 'www.', '.tv', 'twitch.tv', '.net', '.com', 'twitter.com', 'paypal.me', '.me', 'donate.', '.gg', 'binzy'];

            if (forbiddenNames.some(word => event.user.username.toLowerCase().includes(word))) {

                let toDMEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.secondaryError)
                    .setAuthor({ name: '[EXPULSADO]', iconURL: event.guild.iconURL({dynamic: true}) })
                    .setDescription(`<@${event.user.id}>, has sido expulsado de ${event.guild.name}`)
                    .addField('Moderador', client.user, true)
                    .addField('Razón', 'No está permitido utilizar enlaces como nombre de usuario.', true)

                await event.user.send({ embeds: [toDMEmbed] });
                await event.kick(event.user, {reason: `Moderador: ${client.user.id}, Razón: No está permitido utilizar enlaces como nombre de usuario.`})

                .catch ((err) => {
                    console.error(`${new Date().toLocaleString()} 》${err.stack}`);

                    let errorEmbed = new client.MessageEmbed()
                        .setColor(client.config.colors.error)
                        .setTitle(`${client.customEmojis.redTick} Ocurrió un error`)
                        .setDescription(`Ocurrió un error durante la ejecución del evento "guildMemberAdd".\nEl usuario ${event.user.username} no fue expulsado automáticamente de la comunidad, por lo que será necesario emprender acciones de forma manual.`);
                        
                    client.loggingChannel.send({ embeds: [errorEmbed] });
                });
            } else  {
                let loggingWelcomeEmbed = new client.MessageEmbed()
                    .setColor(client.config.colors.correct)
                    .setThumbnail(event.user.displayAvatarURL({dynamic: true}))
                    .setAuthor({ name: 'Nuevo miembro', iconURL: 'attachment://in.png' })
                    .setDescription(`${event.user.username} se unió al servidor`)
                    .addField('🏷 TAG completo', event.user.tag, true)
                    .addField('🆔 ID del miembro', event.user.id, true);

                await client.joinsAndLeavesChannel.send({ embeds: [loggingWelcomeEmbed], files: ['./resources/images/in.png'] });
            };
        } else {
            if (event.guild.member(event.user).roles.cache.has('426789294007517205')) return;
            event.guild.member(event.user).roles.add('426789294007517205');

            let loggingWelcomeBotEmbed = new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Auditoría - [BOTS]')
                .setDescription(`El **BOT** @${event.user.tag} fue añadido al servidor.`);

            return client.joinsAndLeavesChannel.send({ embeds: [loggingWelcomeBotEmbed] });
        };
    } catch (error) {
        if (error.toLocaleString().includes('Cannot send messages to this user')) return;
        await client.functions.eventErrorHandler(error, 'guildMemberAdd');
    };
};
