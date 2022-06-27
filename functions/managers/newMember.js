//Función para gestionar nuevos miembros
exports.run = async (client, member) => {

    //Almacena las traducciones
    const locale = client.locale.functions.managers.newMember;

    try {

        //Si hay que explicar a los miembros con un nombre de usuario prohibido
        if (client.configkickOnBadUsername) {

            //Comprueba si el nombre de usuario del miembro es válido
            const usernameIsValid = await client.functions.moderation.checkUsername.run(client, member);

            //Aborta si el nombre no era válido
            if (!usernameIsValid) return;
        };

        //Genera un embed con el registro de bienvenida
        let welcomeEmbed = new client.MessageEmbed()
            .setColor(client.config.colors.correct)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .setAuthor({ name: locale.author, iconURL: 'attachment://in.png' })
            .setDescription(await client.functions.utilities.parseLocale.run(locale.description, { memberTag: member.user.tag }))
            .addField(`🆔 ${locale.memberId}`, member.user.id, true)
            .addField(`📝 ${locale.registerDate}`, `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, true)

        //Comprueba qué tipo de sanción tiene el miembro (si la tiene, según duración), y añade el campo al embed de registro (si pertoca)
        if (client.db.mutes[member.id] && client.db.mutes[member.id].until) welcomeEmbed.addField(`🔇 ${locale.actualSanction}`, `${locale.limitedSanction}: <t:${Math.round(new Date(client.db.mutes[member.id].until) / 1000)}>`, false);
        else if (client.db.mutes[member.id] && !client.db.mutes[member.id].until) welcomeEmbed.addField(`🔇 ${locale.actualSanction}`, locale.unlimitedSantion, false);

        //Se notifica en el canal de registro
        if (client.config.logging.memberJoined) await client.joinsAndLeavesChannel.send({ embeds: [ welcomeEmbed ], files: ['./resources/images/in.png'] });

        //Añade el rol de bienvenida para nuevos miembros (si no lo tiene ya)
        if (member.roles.cache.has(client.config.main.newMemberRole)) await member.roles.add(client.config.main.newMemberRole);

    } catch (error) {

        //Ignora si el miembro no permite que se le envíen MDs
        if (error.toString().includes('Cannot send messages to this user')) return;

    };
};