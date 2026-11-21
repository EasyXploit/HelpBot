//Función para gestionar nuevos miembros
exports.run = async (member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.newMember;

    try {

        //Si hay que explicar a los miembros con un nombre de usuario prohibido
        if (client.config.moderation.kickOnBadUsername) {

            //Comprueba si el nombre de usuario del miembro es válido
            const usernameIsValid = await client.functions.moderation.checkUsername.run(member);

            //Aborta si el nombre no era válido
            if (!usernameIsValid) return;
        };

        //Genera un embed con el registro de bienvenida
        let welcomeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .setAuthor({ name: locale.author, iconURL: 'attachment://in.png' })
            .setDescription(await client.functions.utilities.parseLocale.run(locale.description, { memberTag: member.user.tag }))
            .addFields(
                { name: `🆔 ${locale.memberId}`, value: member.user.id, inline: true },
                { name: `📝 ${locale.registerDate}`, value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true }
            );

        //Comprueba si el miembro está silenciado, y añade el campo al embed de registro (si procede)
        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) welcomeEmbed.addFields({ name: `🔇 ${locale.actualSanction}`, value: `${locale.mutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>`, inline: false });

        //Se notifica en el canal de registro
        if (client.config.logging.memberJoined) await client.joinsAndLeavesChannel.send({ embeds: [ welcomeEmbed ], files: ['./resources/images/in.png'] });

        //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
        if (client.config.main.newMemberRole && !member.roles.cache.has(client.config.main.newMemberRole)) await member.roles.add(client.config.main.newMemberRole);

    } catch (error) {

        //Ignora si el miembro no permite que se le envíen MDs
        if (error.toString().includes('Cannot send messages to this user')) return;

    };
};