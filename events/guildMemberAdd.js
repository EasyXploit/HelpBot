exports.run = async (member, client) => {
    
    try {

        //Si el nuevo miembro es un bot
        if (member.user.bot) {

            //Añade el rol de bienvenida para nuevos bots (si no lo tiene ya)
            if (!member.roles.cache.has(client.config.main.newBotRole)) await member.roles.add(client.config.main.newBotRole);

            //Envía un mensaje al canal de registro
            return client.functions.loggingManager('embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle('📑 Registro - [BOTS]')
                .setDescription(`El **BOT** @${member.user.tag} fue añadido al servidor.`)
            );
        };

        //Almacena las listas de palabras prohibidas
        const forbiddenNames = client.config.moderation.newMemberForbiddenNames;
        const bannedWords = client.config.bannedWords;

        //Si procede, comprueba si han de comprobarse los nombres de usuario
        const containsForbiddenNames = forbiddenNames.some(word => member.user.username.toLowerCase().includes(word));
        const containsBannedWords = client.config.moderation.includeBannedWords ? bannedWords.some(word => member.user.username.toLowerCase().includes(word)) : false;

        //Si contiene alguna palabra prohibida
        if (containsForbiddenNames || containsBannedWords) {

            //Si no hay caché de registros
            if (!client.loggingCache) client.loggingCache = {};

            //Crea una nueva entrada en la caché de registros
            client.loggingCache[member.id] = {
                action: 'kick',
                executor: client.user.id,
                reason: 'El nombre de usuario contenía una palabra prohibida'
            };

            //Alerta al miembro de que ha sido expulsado
            await member.user.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: '[EXPULSADO]', iconURL: member.guild.iconURL({dynamic: true}) })
                .setDescription(`${member.user}, has sido expulsado de ${member.guild.name}`)
                .addField('Moderador', client.user, true)
                .addField('Razón', 'Tu nombre de usuario contiene una palabra prohibida en la comunidad.', true)
            ]});

            //Se expulsa al miembro
            await member.kick(member.user, { reason: 'El nombre de usuario contenía una palabra prohibida' });
        };

        //Genera un con el registro de bienvenida
        let welcomeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .setAuthor({ name: 'Nuevo miembro', iconURL: 'attachment://in.png' })
            .setDescription(`${member.user.tag} se unió al servidor`)
            .addField('🆔 ID del miembro', member.user.id, true)
            .addField('📝 Fecha de registro', `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)

        //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración), y añade el campo al embed de registro (si pertoca)
        if (client.db.mutes[member.id] && client.db.mutes[member.id].until) welcomeEmbed.addField('🔇 Sanción actual', `Silenciado hasta <t:${Math.round(new Date(client.db.mutes[member.id].until) / 1000)}>`, false);
        else if (client.db.mutes[member.id] && !client.db.mutes[member.id].until) welcomeEmbed.addField('🔇 Sanción actual', 'Silenciado indefinidamente', false);

        //Se notifica en el canal de registro
        await client.joinsAndLeavesChannel.send({ embeds: [ welcomeEmbed ], files: ['./resources/images/in.png'] });

        //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
        if (member.roles.cache.has(client.config.main.newMemberRole)) await member.roles.add(client.config.main.newMemberRole);

    } catch (error) {

        //Ignora si el miembro no permite que se le envíen MDs
        if (error.toLocaleString().includes('Cannot send messages to this user')) return;

        //Invoca el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildMemberAdd');
    };
};
