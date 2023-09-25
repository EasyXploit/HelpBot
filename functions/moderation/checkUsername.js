//Función para comprobar los nombres de usuario de los miembros
exports.run = async (member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.moderation.checkUsername;

    //Almacena las listas de palabras prohibidas
    const forbiddenNames = client.config.moderation.newMemberForbiddenNames;
    const bannedWords = client.config.bannedWords;

    //Si procede, comprueba si han de comprobarse los nombres de usuario
    const containsForbiddenNames = forbiddenNames.some(word => member.displayName.toLowerCase().includes(word));
    const containsBannedWords = client.config.moderation.includeBannedWords ? bannedWords.some(word => member.displayName.toLowerCase().includes(word)) : false;

    //Si contiene alguna palabra prohibida
    if (containsForbiddenNames || containsBannedWords) {

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: client.user.id,
            reason: locale.kickReason
        };
        
        try {

            //Alerta al miembro de que ha sido expulsado
            await member.user.send({ embeds: [ new client.MessageEmbed()
                .setColor(client.config.colors.secondaryError)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: member.guild.iconURL({dynamic: true}) })
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.description, { member: member, guildName: member.guild.name })}.`)
                .addFields(
                    { name: locale.privateEmbed.moderator, value: `${client.user}`, inline: true },
                    { name: locale.privateEmbed.reasonTitle, value: `${locale.privateEmbed.reasonDescription}.`, inline: true }
                )
            ]});

        } catch (error) {

            //Si no se puede enviar el mensaje, omite el error
            if (error.toString().includes('Cannot send messages to this user')) null;
        };

        //Se expulsa al miembro
        await member.kick(member.user, { reason: locale.kickReason });

        //Devuelve "false"
        return false;
    };

    //Devuelve "true"
    return true;
};