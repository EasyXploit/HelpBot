//Función para comprobar los nombres de usuario de los miembros
export default async (member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.moderation.checkUsername;

    //Almacena las listas de palabras prohibidas
    const forbiddenNames = await client.functions.db.getConfig('moderation.newMemberForbiddenNames');
    const bannedWords = await client.functions.db.getConfig('moderation.bannedWords');

    //Si procede, comprueba si han de comprobarse los nombres de usuario
    const containsForbiddenNames = forbiddenNames.some(word => member.displayName.toLowerCase().includes(word));
    const containsBannedWords = await client.functions.db.getConfig('moderation.includeBannedWords') ? bannedWords.some(word => member.displayName.toLowerCase().includes(word)) : false;

    //Si contiene alguna palabra prohibida
    if (containsForbiddenNames || containsBannedWords) {

        //Comprueba si al bot le faltan permisos
        const missingPermissions = await client.functions.utils.missingPermissions(null, logChannel.guild.members.me, ['KickMembers'], true);

        //Si le faltaron permisos al bot
        if (missingPermissions) {

            //Advierte por consola de que no se tienen permisos
            logger.warn(`Cannot kick the member ${member.user.tag} (${member.id}) due to a bad username. The bot must have the following permissions on the server: ${missingPermissions}`);

            //Devuelve un estado validado
            return true;
        };

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: client.user.id,
            reason: locale.kickReason
        };

        //Alerta al miembro de que ha sido expulsado
        await member.user.send({ embeds: [ new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
            .setAuthor({ name: locale.privateEmbed.author, iconURL: member.guild.iconURL({dynamic: true}) })
            .setDescription(`${await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: member.guild.name })}.`)
            .addFields(
                { name: locale.privateEmbed.moderator, value: `${client.user}`, inline: true },
                { name: locale.privateEmbed.reasonTitle, value: `${locale.privateEmbed.reasonDescription}.`, inline: true }
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