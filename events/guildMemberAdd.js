exports.run = async (member, client) => {
    
    try {

        //Previene que continue la ejecución si el servidor no es el principal
        if (member.guild.id !== client.homeGuild.id) return;

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

            //Alerta al miembro de que ha sido expulsado
            await member.user.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: '[EXPULSADO]', iconURL: member.guild.iconURL({dynamic: true}) })
                .setDescription(`${member.user}, has sido expulsado de ${member.guild.name}`)
                .addField('Moderador', client.user, true)
                .addField('Razón', 'Tu nombre de usuario contiene una palabra prohibida en la comunidad.', true)
            ]});

            //Se expulsa al miembro
            await member.kick(member.user, {reason: `Moderador: ${client.user.id}, Razón: El nombre de usuario contenía una palabra prohibida.`})
        };

        //Si el miembro tiene un silenciamiento en vigor
        if (client.db.mutes[member.id]) {

            //Comprueba si existe el rol silenciado, sino lo crea
            const mutedRole = await client.functions.checkMutedRole(member.guild);

            //Añade el rol silenciado al miembro
            await member.roles.add(mutedRole);

            //Propaga el rol silenciado
            client.functions.spreadMutedRole(member.guild);
        };

        //Se notifica en el canal de registro
        await client.joinsAndLeavesChannel.send({ embeds: [ new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .setAuthor({ name: 'Nuevo miembro', iconURL: 'attachment://in.png' })
            .setDescription(`${member.user.tag} se unió al servidor`)
            .addField('🆔 ID del miembro', member.user.id, true)
            .addField('📝 Fecha de registro', `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)
        ], files: ['./resources/images/in.png'] });

        //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
        if (member.roles.cache.has(client.config.main.newMemberRole)) await member.roles.add(client.config.main.newMemberRole);

    } catch (error) {

        //Ignora si el miembro no permite que se le envíen MDs
        if (error.toLocaleString().includes('Cannot send messages to this user')) return;

        //Invoca el manejador de errores
        await client.functions.eventErrorHandler(error, 'guildMemberAdd');
    };
};
