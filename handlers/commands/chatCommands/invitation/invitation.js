exports.run = async (client, interaction, commandConfig, locale) => {
    
    try {

        //Almacena el código de invitación
        let foundInvite;

        //Función para crear una invitación
        async function createInvite() {

            //Almacena el canal para crear la invitación
            let inviteChannel;
            
            //Comprueba si hay canal de reglas y si se tiene permiso para crear la invitación
            if (client.homeGuild.rulesChannel && !(client.homeGuild.rulesChannel.permissionsFor(client.user) & BigInt(0x1)) !== BigInt(0x1)) {

                //Almacena el canal de reglas
                inviteChannel = client.homeGuild.rulesChannel;

            } else {

                //De lo contrario, hace lo propio con el primer canal que lo permita
                await client.homeGuild.channels.fetch().then( async channels => {

                    //Filtra los canales para que solo se incluyan los de texto
                    channels = await channels.filter(channel => channel.type === 'GUILD_TEXT')

                    //Hace un mapa de las IDs de los canales
                    const channelIds = channels.map(channel => channel.id);

                    //Comprueba en cada canal si se puede crear la invitación
                    for (index = 0; index < channels.size; index++) {

                        //Obtiene el canal en base a la ID de la lista
                        const channel = channels.get(channelIds[index]);

                        //Si tiene permisos, graba la invitación
                        if(!(channel.permissionsFor(client.user) & BigInt(0x1)) !== BigInt(0x1)) return inviteChannel = channel;
                    };
                });
            };

            //Crea una invitación permanente en el canal
            await inviteChannel.createInvite({maxAge: 0, reason: await client.functions.utilities.parseLocale.run(locale.inviteReason, { botTag: client.user.tag })}).then(async invite => { foundInvite = invite.code; });

            //Graba la invitación en memoria (en el cliente)
            client.config.dynamic.inviteCode = foundInvite;

            //Graba la invitación en el fichero de configuración
            await client.fs.writeFile('./configs/dynamic.json', JSON.stringify(client.config.dynamic, null, 4), async err => { if (err) throw err });
        };

        //Almacena la invitación obtenida
        let obtainedInvite;

        //Si no hay una invitación grabada
        if (!client.config.dynamic.inviteCode) {

            //Comprueba si ya existe una invitación
            await client.homeGuild.invites.fetch().then(invites => {
                invites.forEach(async invite => {
                    if (invite.inviter === client.user) foundInvite = invite.code;
                });
            });

            //Crea la invitación si no existe
            if (!foundInvite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            if (client.config.dynamic.inviteCode) obtainedInvite = `https://discord.gg/${client.config.dynamic.inviteCode}`;

        } else {
            //Busca la invitación
            const invite = await client.homeGuild.invites.resolve(client.config.dynamic.inviteCode);

            //Crea la invitación si no existe
            if (!invite) await createInvite();

            //Devuelve la URL, si se puedo obtener un código
            obtainedInvite = `https://discord.gg/${client.config.dynamic.inviteCode}`;
        };

        //Genera el embed y lo envía, buscando el contenido necesario con la función
        await interaction.reply({ embeds: [new client.MessageEmbed()
            .setColor(client.config.colors.primary)
            .setAuthor({ name: locale.embed.author, iconURL: client.homeGuild.iconURL({dynamic: true}) })
            .setDescription(obtainedInvite)
            .setFooter({ text: `${locale.embed.footer}.` })
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError.run(client, error, interaction);
    };
};

module.exports.config = {
    type: 'global',
    defaultPermission: false,
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT'
    }
};
