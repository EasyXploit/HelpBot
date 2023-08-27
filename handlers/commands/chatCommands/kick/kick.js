export async function run(interaction, commandConfig, locale) {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede expulsar bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], ephemeral: true});
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Se comprueba si el rol del bot es más bajo que el del miembro objetivo
        if (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badBotHierarchy}`)
        ], ephemeral: true});

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[1] ? interaction.options._hoistedOptions[1].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[member.id] = {
            action: 'kick',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

        //Notifica la acción en el canal de invocación
        await interaction.reply({embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});

        try {
        
            //Envía una notificación al miembro
            await member.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { member: member, guildName: interaction.guild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbed.reason, value: reason || locale.undefinedReason, inline: true }
                )
            ]});

        } catch (error) {

            //Maneja los errores ocurridos cuando no se puede entregar un mensaje privado
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver a "kick log" message to @${member.user.username} (${member.id}) due to an API restriction`);
            else await client.functions.managers.interactionError(error, interaction);
        };

        //Expulsa al miembro
        await member.kick(reason || locale.undefinedReason);
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: ['KickMembers'],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('KickMembers'),
    dmPermission: false,
    appData: {
        type: discord.ApplicationCommandType.ChatInput,
        options: [
            {
                optionName: 'user',
                type: discord.ApplicationCommandOptionType.User,
                required: true
            },
            {
                optionName: 'reason',
                type: discord.ApplicationCommandOptionType.String,
                required: false
            }
        ]
    }
};
