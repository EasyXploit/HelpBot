exports.run = async (member, client, locale) => {
    
    try {

        //Aborta si no es un evento de la guild registrada
        if (member.guild.id !== client.homeGuild.id) return;

        //Si el nuevo miembro es un bot
        if (member.user.bot) {

            //Añade el rol de bienvenida para nuevos bots (si no lo tiene ya)
            if (!member.roles.cache.has(client.config.main.newBotRole)) await member.roles.add(client.config.main.newBotRole);

            //Envía un mensaje al canal de registro
            return await client.functions.managers.logging.run(client, 'embed', new client.MessageEmbed()
                .setColor(client.config.colors.logging)
                .setTitle(`📑 ${locale.botLoggingEmbed.title}`)
                .setDescription(`${await client.functions.utilities.parseLocale.run(locale.botLoggingEmbed.description, { memberTag: member.user.tag })}.`)
            );
        };

        //Ejecuta el manejador de nuevos miembros (si procede)
        if (client.config.main.newMemberMode === 'before') await client.functions.managers.newMember.run(client, member);

    } catch (error) {

        //Invoca el manejador de errores
        await client.functions.managers.eventError.run(client, error, 'guildMemberAdd');
    };
};
