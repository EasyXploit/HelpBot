export async function run(interaction, commandConfig, locale) {
    
    try {

        //Almacena el código de invitación que hay en la BD
        let inviteCode = await client.functions.db.getConfig('system.inviteCode');

        //Función para crear una invitación en cualquier canal disponible
        async function createInvite() {

            //Almacena el canal para crear la invitación
            let targetChannel;

            //Almacena si faltan permisos en el canal de reglas
            const missingPermissionOnRulesChannel = await client.functions.utils.missingPermissions(client.baseGuild.rulesChannel, client.baseGuild.me, ['CREATE_INSTANT_INVITE'], true);
            
            //Comprueba si hay canal de reglas y si se tiene permiso para crear la invitación
            if (client.baseGuild.rulesChannel && !missingPermissionOnRulesChannel) {

                //Almacena el canal de reglas
                targetChannel = client.baseGuild.rulesChannel;

            } else {

                //De lo contrario, hace lo propio con el primer canal que lo permita
                await client.baseGuild.channels.fetch().then(async channels => {

                    //Filtra los canales para que solo se incluyan los de texto
                    channels = await channels.filter(channel => channel.type === 'GUILD_TEXT');

                    //Hace un mapa de las IDs de los canales
                    const channelIds = channels.map(channel => channel.id);

                    //Comprueba en cada canal si se puede crear la invitación
                    for (index = 0; index < channels.size; index++) {

                        //Obtiene el canal en base a la ID de la lista
                        const channel = channels.get(channelIds[index]);

                        //Almacena si faltan permisos en el canal
                        const missingPermission = await client.functions.utils.missingPermissions(channel, client.baseGuild.me, ['CREATE_INSTANT_INVITE'], true);

                        //Si tiene permisos, graba la invitación
                        if(!missingPermission) return targetChannel = channel;
                    };
                });
            };

            //Si no se encontró un canal válido
            if (!targetChannel) {

                //Muestra un error al usuario
                await interaction.reply({ embeds: [new discord.MessageEmbed()
                    .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                    .setDescription(`${client.customEmojis.redTick} ${locale.noTargetChannel}`)
                ]});

                //Devuelve un estado erróneo
                return false;
            };

            //Crea una invitación permanente en el canal
            await targetChannel.createInvite({maxAge: 0, reason: await client.functions.utils.parseLocale(locale.inviteReason, { botTag: client.user.tag })}).then(async invite => { inviteCode = invite.code; });

            //Graba la invitación en la BD
            await client.functions.db.setConfig('system.inviteCode', inviteCode);

            //Retorna la invitación
            return inviteCode;
        };

        //Si no hay una invitación grabada en la BD
        if (!inviteCode) {

            //Almacena todas las invitaciones de la guild
            await client.baseGuild.invites.fetch().then(invites => {

                //Por cada una de las invitaciones
                invites.forEach(async invite => {

                    //Si es del bot
                    if (invite.inviter === client.user) {

                        //Almacena el código de la invitación
                        inviteCode = invite.code;

                        //Graba la invitación en la BD, si se llegó a crear
                        await client.functions.db.setConfig('system.inviteCode', inviteCode);
                    };
                });
            });

            //Crea la invitación si no existe
            if (!inviteCode) inviteCode = await createInvite();

        } else {

            //Busca la invitación existente
            const existingInvite = await client.baseGuild.invites.resolve(inviteCode);

            //Crea la invitación si ya no existe
            if (!existingInvite) inviteCode = await createInvite();
        };

        //Aborta el resto del comando si no se pudo generar una invitación
        if (!inviteCode) return 

        //Almacena la URL de la invitación
        const resultInviteURL = `https://discord.gg/${inviteCode}`;

        //Genera el embed y lo envía, buscando el contenido necesario con la función
        await interaction.reply({ embeds: [new discord.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.primary')}`)
            .setAuthor({ name: locale.resultEmbed.author, iconURL: client.baseGuild.iconURL({dynamic: true}) })
            .setDescription(resultInviteURL)
            .setFooter({ text: `${locale.resultEmbed.footer}.` })
        ]});

    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: [],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('Administrator'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput
    }
};
