//Función para gestionar nuevos miembros
exports.run = async (member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.newMember;

    try {

        //Si hay que explicar a los miembros con un nombre de usuario prohibido
        if (await client.functions.db.getConfig.run('moderation.kickOnBadUsername')) {

            //Comprueba si el nombre de usuario del miembro es válido
            const usernameIsValid = await client.functions.moderation.checkUsername.run(member);

            //Aborta si el nombre no era válido
            if (!usernameIsValid) return;
        };

        //Genera un embed con el registro de bienvenida
        let welcomeEmbed = new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig.run('colors.correct')}`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .setAuthor({ name: locale.author, iconURL: 'attachment://in.png' })
            .setDescription(await client.functions.utilities.parseLocale.run(locale.description, { memberTag: member.user.tag }))
            .addFields(
                { name: `🆔 ${locale.memberId}`, value: member.user.id, inline: true },
                { name: `📝 ${locale.registerDate}`, value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true }
            );

        //Comprueba si el miembro está silenciado, y añade el campo al embed de registro (si procede)
        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) welcomeEmbed.addFieldw({ name: `🔇 ${locale.actualSanction}`, value: `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>`, inline: false });

        //Se notifica en el canal de registro
        await client.functions.managers.logging.run('memberJoined', 'embed', welcomeEmbed, ['./resources/images/in.png']);

        //Almacena el ID del rol para nuevos miembros
        const newMemberRoleId = await client.functions.db.getConfig.run('welcomes.newMemberRoleId');

        //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
        if (newMemberRoleId.length > 0 && member.roles.cache.has(newMemberRoleId)) await member.roles.add(newMemberRoleId);

    } catch (error) {

        //Ignora si el miembro no permite que se le envíen MDs
        if (error.toString().includes('Cannot send messages to this user')) return;
    };
};