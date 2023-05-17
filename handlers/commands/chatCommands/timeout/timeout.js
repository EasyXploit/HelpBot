export async function run(interaction, commandConfig, locale) {
    
    try {

        //Busca al miembro proporcionado
        const member = await client.functions.utils.fetch('member', interaction.options._hoistedOptions[0].value);

        //Devuelve un error si no se ha encontrado al miembro
        if (!member) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.memberNotFound}.`)
        ], ephemeral: true});

        //Si el miembro era un bot
        if (member.user.bot) {

            //Almacena si el miembro puede silenciar bots
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.botsAllowed});

            //Si no está autorizado para ello, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noBots}.`)
            ], ephemeral: true});
        };
        
        //Se comprueba si el rol del miembro ejecutor es más bajo que el del miembro objetivo
        if (interaction.member.id !== interaction.guild.ownerId && interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.error')}`)
            .setDescription(`${client.customEmojis.redTick} ${locale.badHierarchy}.`)
        ], ephemeral: true});

        //Almacena la expiración provista
        const expiresAfter = interaction.options._hoistedOptions[1].value;

        //Si la expiración supera el umbral permitido para todos
        if (expiresAfter > commandConfig.maxRegularTime) {

            //Almacena si el miembro puede silenciar por más tiempo
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.unlimitedTime});

            //Si no se permitió la ejecución, manda un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.secondaryError')}`)
                .setDescription(`${client.customEmojis.redTick} ${await client.functions.utils.parseLocale(locale.exceededDuration, { time: await client.functions.utils.msToTime(commandConfig.maxRegularTime) })}.`)
            ], ephemeral: true});
        };

        //Almacena la razón
        let reason = interaction.options._hoistedOptions[2] ? interaction.options._hoistedOptions[2].value : null;

        //Capitaliza la razón
        if (reason) reason = `${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;

        //Si no se ha proporcionado razón
        if (!reason) {

            //Almacena si el miembro puede omitir la razón
            const authorized = await client.functions.utils.checkAuthorization(interaction.member, { guildOwner: true, botManagers: true, bypassIds: commandConfig.reasonNotNeeded});

            //Si no está autorizado, devuelve un mensaje de error
            if (!authorized) return interaction.reply({ embeds: [ new client.MessageEmbed()
                .setColor(`${await client.functions.db.getConfig('colors.error')}`)
                .setDescription(`${client.customEmojis.redTick} ${locale.noReason}.`)
            ], ephemeral: true});
        };

        //Guarda el aislamiento en la base de datos
        await client.functions.db.genData('timeout', {
            userId: member.id,
            moderatorId: interaction.member.id,
            untilTimestamp: Date.now() + expiresAfter
        });

        //Si no hay caché de registros
        if (!client.loggingCache) client.loggingCache = {};

        //Crea una nueva entrada en la caché de registros
        client.loggingCache[member.id] = {
            action: 'timeout',
            executor: interaction.member.id,
            reason: reason || locale.undefinedReason
        };

        //Deshabilita la comunicación del miembro en el servidor
        await member.disableCommunicationUntil((Date.now() + expiresAfter), reason || locale.undefinedReason);

        //Genera una descripción para el embed de notificación
        const notificationEmbedDescription = reason ? await client.functions.utils.parseLocale(locale.notificationEmbed.withReason, { memberTag: member.user.tag, reason: reason }) : await client.functions.utils.parseLocale(locale.notificationEmbed.withoutReason, { memberTag: member.user.tag })

        //Notifica la acción en el canal de invocación
        await interaction.reply({ embeds: [ new client.MessageEmbed()
            .setColor(`${await client.functions.db.getConfig('colors.warning')}`)
            .setDescription(`${client.customEmojis.orangeTick} ${notificationEmbedDescription}`)
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
        channel: ['USE_EXTERNAL_EMOJIS', 'MODERATE_MEMBERS']
    },
    defaultMemberPermissions: new client.Permissions('MODERATE_MEMBERS'),
    dmPermission: false,
    appData: {
        type: 'CHAT_INPUT',
        options: [
            {
                optionName: 'user',
                type: 'USER',
                required: true
            },
            {
                optionName: 'expiration',
                type: 'NUMBER',
                required: true,
                choices: [
                    {
                        choiceName: 'sixtySeconds',
                        value: 60000
                    },
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
                    }
                ]
            },
            {
                optionName: 'reason',
                type: 'STRING',
                required: false
            }
        ]
    }
};
