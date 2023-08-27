export async function run(interaction, commandConfig, locale) {
    
    try {
        
        //Busca al usuario proporcionado
        const user = await client.functions.utils.fetch('user', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al usuario
        if (!user) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.userNotFound}`)
        ], ephemeral: true});

        //Si el usuario era un bot
        if (user.bot) {

            //Almacena si el miembro puede banear bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}`)
            ], ephemeral: true});
        };

        //Busca al miembro proporcionado
        const member = await client.functions.utils.fetch('member', user.id);

        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (member && ((interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) || !member.bannable)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}`)
        ], ephemeral: true});

        //Se comprueba si el rol del bot es más bajo que el del miembro objetivo
        if (member && (interaction.guild.members.me.roles.highest.position <= member.roles.highest.position)) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badBotHierarchy}`)
        ], ephemeral: true});
        
        //Se comprueba si el usuario ya estaba baneado
        const guildBans = await interaction.guild.bans.fetch();

        //Comprueba si el usuario ya estaba baneado
        for (const bans of guildBans) {

            //Si el usuario ya estaba baneado, devuelve un error
            if (bans[0] === user.id) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.alreadyBanned}`)
            ], ephemeral: true});
        };

        //Almacena la duración provista
        const durationOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.expiration.name);
        const providedDuration = durationOption ? durationOption.value : null;

        //Si no se ha proporcionado una duración
        if (!providedDuration) {

            //Almacena si el miembro puede banear indefinidamente
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantPermaBan}.`)
            ], ephemeral: true});
        };

        //Si se ha proporcionado una duración para el baneo
        if (providedDuration) {

            //Almacena si el miembro puede banear
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized && providedDuration > commandConfig.maxRegularTime) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.exceededDuration, { time: await client.functions.utils.msToTime(commandConfig.maxRegularTime) })}.`)
            ], ephemeral: true});
        };

        //Almacena los días de mensajes borrados
        const deletedDaysOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.days.name);
        const deletedDays = deletedDaysOption ? deletedDaysOption.value : null;

        //Si no se ha proporcionado una duración
        if (deletedDays) {

            //Almacena si el miembro puede banear indefinidamente
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.canSoftBan});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.cantSoftBan}.`)
            ], ephemeral: true});
        };
        
        //Almacena la razón
        const reasonOption = interaction.options._hoistedOptions.find(prop => prop.name === locale.appData.options.reason.name);
        let reason = reasonOption ? reasonOption.value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón y el miembro no es el dueño
        if (!reason && interaction.member.id !== interaction.guild.ownerId) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}`)
            ], ephemeral: true});
        };

        //Almacena la expiración del baneo
        const expiration = providedDuration ? Date.now() + providedDuration : null;

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[user.id] = {
            action: 'ban',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason,
            deletedDays: deletedDays ? deletedDays.toString() : null,
            expiration: expiration
        };

        //Si se proporcionó una duración
        if (providedDuration) {

            //Registra el baneo en la base de datos
            await client.functions.db.genData('ban', {
                userId: user.id,
                moderatorId: interaction.member.id,
                untilTimestamp: Date.now() + providedDuration
            });
        };

        //Almacena los parámetros para el baneo
        const banParameters = { reason: reason || locale.undefinedReason };

        //Si se ha proporcionado borrado de mensajes (en días), almacena el parámetro convertido a segundos
        if (deletedDays) banParameters.deleteMessageSeconds = deletedDays * 24 * 60 * 60;

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { userTag: user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { userTag: user.tag })

        //Envía una confirmación como respuesta a la interacción
        await interaction.reply({ embeds: [ new discord.EmbedBuilder()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
        ]});

        try {
        
            //Envía una notificación al miembro
            if (member) await user.send({ embeds: [ new discord.EmbedBuilder()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setAuthor({ name: locale.privateEmbed.author, iconURL: interaction.guild.iconURL({ dynamic: true}) })
                .setDescription(await client.functions.utils.parseLocale(locale.privateEmbed.description, { user: user, guildName: interaction.guild.name }))
                .addFields(
                    { name: locale.privateEmbed.moderator, value: interaction.user.tag, inline: true },
                    { name: locale.privateEmbed.reason, value: reason || locale.undefinedReason, inline: true },
                    { name: locale.privateEmbed.expiration, value: expiration ? `<t:${Math.round(new Date(parseInt(expiration)) / 1000)}:R>` : locale.privateEmbed.noExpiration, inline: true },
                    { name: locale.privateEmbed.deletedDays, value: deletedDays ? deletedDays.toString() : `\`${locale.privateEmbed.noDeletedDays}\``, inline: true }
                )
            ]});

        } catch (error) {

            //Maneja los errores ocurridos cuando no se puede entregar un mensaje privado
            if (error.toString().includes('Cannot send messages to this user')) logger.warn(`The bot was unable to deliver the "ban log" message to @${user.username} (${user.id}) due to an API restriction`);
            else await client.functions.managers.interactionError(error, interaction);
        };

        //Banea al usuario
        await interaction.guild.members.ban(user, banParameters);
        
    } catch (error) {

        //Ejecuta el manejador de errores
        await client.functions.managers.interactionError(error, interaction);
    };
};

export let config = {
    type: 'global',
    neededBotPermissions: {
        guild: ['BanMembers'],
        channel: ['UseExternalEmojis']
    },
    defaultMemberPermissions: new discord.PermissionsBitField('BanMembers'),
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
            },
            {
                optionName: 'days',
                type: discord.ApplicationCommandOptionType.Integer,
                minValue: 1,
                maxValue: 7,
                required: false
            },
            {
                optionName: 'expiration',
                type: discord.ApplicationCommandOptionType.Number,
                required: false,
                choices: [
                    {
                        choiceName: 'fiveMinutes',
                        value: 300000
                    },
                    {
                        choiceName: 'fifteenMinutes',
                        value: 900000
                    },
                    {
                        choiceName: 'thirtyMinutes',
                        value: 1800000
                    },
                    {
                        choiceName: 'oneHour',
                        value: 3600000
                    },
                    {
                        choiceName: 'sixHours',
                        value: 21600000
                    },
                    {
                        choiceName: 'twelveHours',
                        value: 43200000
                    },
                    {
                        choiceName: 'oneDay',
                        value: 86400000
                    },
                    {
                        choiceName: 'threeDays',
                        value: 259200000
                    },
                    {
                        choiceName: 'oneWeek',
                        value: 604800016
                    },
                    {
                        choiceName: 'oneMonth',
                        value: 2629800000
                    },
                    {
                        choiceName: 'threeMonths',
                        value: 7889400000
                    },
                    {
                        choiceName: 'sixMonths',
                        value: 15778800000
                    },
                    {
                        choiceName: 'nineMonths',
                        value: 23668200000
                    },
                    {
                        choiceName: 'oneYear',
                        value: 31557600000
                    }
                ]
            }
        ]
    }
};