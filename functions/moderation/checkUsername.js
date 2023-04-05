//Función para comprobar los nombres de usuario de los miembros
exports.run = async (client, member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.moderation.checkUsername;

    //Almacena las listas de palabras prohibidas
    const forbiddenNames = await client.functions.db.getConfig.run('moderation.newMemberForbiddenNames');
    const bannedWords = await client.functions.db.getConfig.run('moderation.bannedWords');

    //Si procede, comprueba si han de comprobarse los nombres de usuario
    const containsForbiddenNames = forbiddenNames.some(word => member.displayName.toLowerCase().includes(word));
    const containsBannedWords = await client.functions.db.getConfig.run('moderation.includeBannedWords') ? bannedWords.some(word => member.displayName.toLowerCase().includes(word)) : false;

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

        //Alerta al miembro de que ha sido expulsado
        await member.user.send({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig.run('colors.secondaryError')}`)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: member.guild.iconURL({dynamic: true}) })
            .setDescription(`${await client.functions.utilities.parseLocale.run(locale.privateEmbed.description, { member: member, guildName: member.guild.name })}.`)
            .addFields(
                { name: locale.privateEmbed.moderator, value: `${client.user}`, inline: true },
                { name: reasonTitle, value: `${locale.privateEmbed.reasonDescription}.`, inline: true }
            )
        ]});

        //Se expulsa al miembro
        await member.kick(member.user, { reason: locale.kickReason });

        //Devuelve "false"
        return false;
    };

    //Devuelve "true"
    return true;
};