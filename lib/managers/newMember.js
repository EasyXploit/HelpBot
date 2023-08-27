//Función para gestionar nuevos miembros
export default async (member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.newMember;

    try {

        //Si hay que explicar a los miembros con un nombre de usuario prohibido
        if (await client.functions.db.getConfig('moderation.kickOnBadUsername')) {

            //Comprueba si el nombre de usuario del miembro es válido
            const usernameIsValid = await client.functions.moderation.checkUsername(member);

            //Aborta si el nombre no era válido
            if (!usernameIsValid) return;
        };

        //Genera un embed con el registro de bienvenida
        let welcomeEmbed = new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.correct')}`)
            .setThumbnail(member.user.displayAvatarURL())
            .setAuthor({ name: locale.author, iconURL: 'attachment://in.png' })
            .setDescription(await client.functions.utils.parseLocale(locale.description, { memberTag: member.user.tag }))
            .addFields(
                { name: `🆔 ${locale.memberId}`, value: member.user.id, inline: true },
                { name: `📝 ${locale.registerDate}`, value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true }
            );

        //Comprueba si el miembro está silenciado, y añade el campo al embed de registro (si procede)
        if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > Date.now()) welcomeEmbed.addFieldw({ name: `🔇 ${locale.actualSanction}`, value: `${locale.timeoutedUntil}: <t:${Math.round(new Date(member.communicationDisabledUntilTimestamp) / 1000)}>`, inline: false });

        //Se notifica en el canal de registro
        await client.functions.managers.sendLog('memberJoined', 'embed', welcomeEmbed, ['./assets/images/in.png']);

        //Almacena el ID del rol para nuevos miembros
        const newMemberRoleId = await client.functions.db.getConfig('welcomes.newMemberRoleId');

        //Si hay rol de bienvenida configurado y el miembro no lo tiene
        if (newMemberRoleId.length > 0 && member.roles.cache.has(newMemberRoleId)) {

            //Comprueba si el bot tiene los permisos requeridos
            const missingPermissions = await client.functions.utils.missingPermissions(null, client.baseGuild.members.me, ['ManageRoles']);
            if (missingPermissions) logger.warn(`The bot could not add the welcome role to the member ${member.user.tag} (${member.id}) because it did not have permission to do so`);
            else await member.roles.add(newMemberRoleId); //Añade el rol al miembro
        };

    } catch (error) {

        //Muestra el error en la consola
        logger.error(error.stack);
    };
};
